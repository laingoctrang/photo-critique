#!/usr/bin/env python3
"""
Advanced ERD generator with better visualization and PlantUML support.
This version provides more detailed ERD with better formatting.
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple

# Configuration
MODEL_DIR = Path(__file__).parent.parent / "src/main/java/com/photo_critique_be/model"
OUTPUT_DIR = Path(__file__).parent.parent
OUTPUT_MERMAID = OUTPUT_DIR / "ERD.mmd"
OUTPUT_PLANTUML = OUTPUT_DIR / "ERD.puml"

RELATIONSHIP_PATTERNS = {
    "user_id": "User",
    "userId": "User",
    "follower_id": "User",
    "following_id": "User",
    "sender_id": "User",
    "receiver_id": "User",
    "post_id": "Post",
    "postId": "Post",
    "original_post_id": "Post",
    "comment_id": "Comment",
    "commentId": "Comment",
    "parent_comment_id": "Comment",
    "conversation_id": "Conversation",
    "badge_id": "Badge",
    "badgeId": "Badge",
    "target_id": None,
    "related_post_id": "Post",
    "related_comment_id": "Comment",
    "related_user_id": "User",
}

class AdvancedModelParser:
    def __init__(self):
        self.models: Dict[str, Dict] = {}
        self.relationships: List[Tuple[str, str, str, str]] = []  # (from, to, field, type)
    
    def parse_java_file(self, file_path: Path) -> Optional[Dict]:
        """Parse Java model file with better field extraction."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return None
        
        class_match = re.search(r'public\s+class\s+(\w+)', content)
        if not class_match:
            return None
        
        class_name = class_match.group(1)
        
        if "embedded" in str(file_path):
            return None
        
        collection_match = re.search(r'@Document\(collection\s*=\s*"([^"]+)"\)', content)
        collection = collection_match.group(1) if collection_match else class_name.lower()
        
        # Better field extraction - handle multi-line annotations
        fields = []
        # Pattern to match @Field annotation followed by field declaration
        field_blocks = re.finditer(
            r'@Field\(["\']([^"\']+)["\']\)[^@]*(?:@\w+[^@]*)*(?:private|protected|public)\s+(?:final\s+)?(\w+(?:<[^>]+>)?)\s+(\w+)\s*[;=]',
            content,
            re.MULTILINE | re.DOTALL
        )
        
        for match in field_blocks:
            field_name_db = match.group(1)
            field_type = match.group(2)
            field_name = match.group(3)
            
            # Check for annotations before the field
            start_pos = max(0, match.start() - 500)
            annotation_block = content[start_pos:match.start()]
            
            indexed = "@Indexed" in annotation_block
            unique = "unique = true" in annotation_block or "@Indexed(unique = true)" in annotation_block
            
            # Skip id field (will add _id separately)
            if field_name_db in ['_id', 'id'] and field_name == 'id':
                continue
            
            fields.append({
                'name': field_name,
                'db_name': field_name_db,
                'type': self.simplify_type(field_type),
                'indexed': indexed,
                'unique': unique
            })
        
        # Detect relationships
        for field in fields:
            field_name = field['db_name']
            if field_name in RELATIONSHIP_PATTERNS:
                target = RELATIONSHIP_PATTERNS[field_name]
                if target:
                    rel_type = "many-to-one"
                    self.relationships.append((class_name, target, field_name, rel_type))
        
        # Special cases
        if class_name == 'Reaction':
            self.relationships.append(('Reaction', 'Post', 'target_id', 'polymorphic'))
            self.relationships.append(('Reaction', 'Comment', 'target_id', 'polymorphic'))
        
        if 'parent_comment_id' in [f['db_name'] for f in fields]:
            self.relationships.append((class_name, class_name, 'parent_comment_id', 'self'))
        
        if 'participants' in [f['name'] for f in fields]:
            self.relationships.append((class_name, 'User', 'participants', 'many-to-many'))
        
        return {
            'class_name': class_name,
            'collection': collection,
            'fields': fields
        }
    
    def simplify_type(self, java_type: str) -> str:
        """Simplify Java type."""
        type_map = {
            'String': 'String',
            'Integer': 'Int',
            'Long': 'Long',
            'Double': 'Double',
            'Float': 'Float',
            'Boolean': 'Bool',
            'LocalDateTime': 'DateTime',
            'LocalDate': 'Date',
            'List': 'Array',
            'ArrayList': 'Array',
            'ObjectId': 'ObjectId',
        }
        
        base = re.sub(r'<.*>', '', java_type).strip()
        if base in type_map:
            return type_map[base]
        
        # Enum detection
        if any(x in java_type for x in ['Type', 'Status', 'Provider', 'Privacy', 'Role']):
            return 'Enum'
        
        return base
    
    def parse_all_models(self):
        """Parse all models."""
        model_files = list(MODEL_DIR.glob("*.java"))
        
        for file_path in model_files:
            if "RankingSnapshot" in file_path.stem and file_path.stem != "RankingSnapshot":
                continue
            model = self.parse_java_file(file_path)
            if model:
                self.models[model['class_name']] = model
    
    def generate_mermaid_erd(self) -> str:
        """Generate enhanced Mermaid ERD."""
        lines = [
            "%% Photo Critique Application - Database ERD",
            "%% Auto-generated from Spring Boot MongoDB models",
            "",
            "erDiagram",
            ""
        ]
        
        # Group entities by domain
        core_entities = ['User', 'Post', 'Comment', 'Reaction']
        social_entities = ['Follow', 'Notification', 'Share', 'SavedPost']
        messaging_entities = ['Conversation', 'Message']
        system_entities = ['Badge', 'XPConfig', 'XPEvent', 'Tag', 'RankingSnapshot', 'AIRequest']
        
        entity_groups = [
            ("Core Entities", core_entities),
            ("Social Features", social_entities),
            ("Messaging", messaging_entities),
            ("System & Config", system_entities),
        ]
        
        # Generate entities
        for group_name, entity_list in entity_groups:
            lines.append(f"    %% {group_name}")
            for class_name in sorted(entity_list):
                if class_name not in self.models:
                    continue
                model = self.models[class_name]
                lines.append(f"    {class_name} {{")
                lines.append("        String _id PK")
                
                # Show important fields only (limit to 10 most important)
                important_fields = []
                for field in model['fields'][:15]:  # Show first 15 fields
                    if field['db_name'] in ['_id', 'id']:
                        continue
                    
                    markers = []
                    if field['unique']:
                        markers.append("UK")
                    elif field['indexed']:
                        markers.append("IDX")
                    
                    marker_str = " " + " ".join(markers) if markers else ""
                    important_fields.append(f"        {field['type']} {field['db_name']}{marker_str}")
                
                lines.extend(important_fields)
                lines.append("    }")
                lines.append("")
        
        # Add relationships with better formatting
        lines.append("    %% Relationships")
        processed = set()
        
        # Group relationships
        relationship_groups = {
            "User Relationships": [],
            "Post Relationships": [],
            "Other Relationships": []
        }
        
        for from_entity, to_entity, field, rel_type in self.relationships:
            if from_entity not in self.models or to_entity not in self.models:
                continue
            
            key = f"{from_entity}->{to_entity}:{field}"
            if key in processed:
                continue
            
            if from_entity == 'User' or to_entity == 'User':
                relationship_groups["User Relationships"].append((from_entity, to_entity, field, rel_type))
            elif from_entity == 'Post' or to_entity == 'Post':
                relationship_groups["Post Relationships"].append((from_entity, to_entity, field, rel_type))
            else:
                relationship_groups["Other Relationships"].append((from_entity, to_entity, field, rel_type))
            
            processed.add(key)
        
        for group_name, rels in relationship_groups.items():
            if rels:
                lines.append(f"    %% {group_name}")
                for from_entity, to_entity, field, rel_type in rels:
                    if from_entity == to_entity:
                        cardinality = "}o--||"
                    elif rel_type == "many-to-many":
                        cardinality = "}o--o{"
                    elif "many" in rel_type:
                        cardinality = "}o--||"
                    else:
                        cardinality = "}o--||"
                    
                    field_label = field.replace('_', ' ').title()
                    lines.append(f"    {from_entity} {cardinality} {to_entity} : \"{field_label}\"")
                lines.append("")
        
        return "\n".join(lines)


def main():
    print("Generating Enhanced ERD...")
    
    parser = AdvancedModelParser()
    parser.parse_all_models()
    
    print(f"Parsed {len(parser.models)} models")
    print(f"Found {len(parser.relationships)} relationships")
    
    mermaid_content = parser.generate_mermaid_erd()
    OUTPUT_MERMAID.write_text(mermaid_content, encoding='utf-8')
    
    print(f"\n✓ Generated: {OUTPUT_MERMAID}")
    print("\nTo convert to image:")
    print("  1. Visit https://mermaid.live/ and paste the content")
    print("  2. Or use: npm install -g @mermaid-js/mermaid-cli && mmdc -i ERD.mmd -o ERD.png")


if __name__ == "__main__":
    main()

