#!/usr/bin/env python3
"""
Script to automatically generate ERD diagram from MongoDB Spring Boot models.
Outputs Mermaid diagram that can be rendered to image.
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
OUTPUT_README = OUTPUT_DIR / "ERD_README.md"

# Relationship patterns to detect
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
    "target_id": None,  # Polymorphic - can reference Post or Comment
    "related_post_id": "Post",
    "related_comment_id": "Comment",
    "related_user_id": "User",
}

class ModelParser:
    def __init__(self):
        self.models: Dict[str, Dict] = {}
        self.relationships: List[Tuple[str, str, str]] = []  # (from, to, field)
    
    def parse_java_file(self, file_path: Path) -> Optional[Dict]:
        """Parse a Java model file and extract metadata."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return None
        
        # Extract class name
        class_match = re.search(r'public\s+class\s+(\w+)', content)
        if not class_match:
            return None
        
        class_name = class_match.group(1)
        
        # Skip embedded classes
        if "embedded" in str(file_path) or "static class" in content:
            return None
        
        # Extract collection name
        collection_match = re.search(r'@Document\(collection\s*=\s*"([^"]+)"\)', content)
        collection = collection_match.group(1) if collection_match else class_name.lower()
        
        # Extract fields
        fields = []
        field_pattern = r'@Field\(["\']([^"\']+)["\']\)\s*\n\s*(?:@\w+\s*\n\s*)*(?:private|protected|public)\s+(?:final\s+)?(\w+(?:<[^>]+>)?)\s+(\w+)'
        for match in re.finditer(field_pattern, content):
            field_name_db = match.group(1)
            field_type = match.group(2)
            field_name = match.group(3)
            
            # Check if indexed
            indexed = "@Indexed" in content[max(0, match.start()-200):match.start()]
            unique = "unique = true" in content[max(0, match.start()-200):match.start()]
            
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
                if target and target != class_name:
                    self.relationships.append((class_name, target, field_name))
        
        # Check for polymorphic relationships
        if 'target_type' in [f['db_name'] for f in fields] and 'target_id' in [f['db_name'] for f in fields]:
            # Reaction can reference Post or Comment
            if class_name == 'Reaction':
                self.relationships.append((class_name, 'Post', 'target_id (target_type=POST)'))
                self.relationships.append((class_name, 'Comment', 'target_id (target_type=COMMENT)'))
        
        # Check for self-references
        if 'parent_comment_id' in [f['db_name'] for f in fields]:
            self.relationships.append((class_name, class_name, 'parent_comment_id'))
        
        # Check for participants (array of ObjectIds)
        if 'participants' in [f['name'] for f in fields]:
            self.relationships.append((class_name, 'User', 'participants'))
        
        # Check for embedded documents
        embedded_types = []
        if 'BadgeEarned' in content:
            embedded_types.append('BadgeEarned')
        if 'ImageInfo' in content:
            embedded_types.append('ImageInfo')
        if 'LastMessage' in content:
            embedded_types.append('LastMessage')
        
        return {
            'class_name': class_name,
            'collection': collection,
            'fields': fields,
            'embedded': embedded_types
        }
    
    def simplify_type(self, java_type: str) -> str:
        """Simplify Java type to basic type."""
        type_mapping = {
            'String': 'String',
            'Integer': 'Number',
            'Long': 'Number',
            'Double': 'Number',
            'Float': 'Number',
            'Boolean': 'Boolean',
            'LocalDateTime': 'DateTime',
            'LocalDate': 'Date',
            'List': 'Array',
            'ArrayList': 'Array',
            'ObjectId': 'ObjectId',
        }
        
        # Handle generics
        base_type = re.sub(r'<.*>', '', java_type).strip()
        if base_type in type_mapping:
            return type_mapping[base_type]
        
        # Handle enums
        if 'enum' in java_type.lower() or any(enum in java_type for enum in ['PrivacyType', 'Role', 'ReactionType']):
            return 'Enum'
        
        return base_type
    
    def parse_all_models(self):
        """Parse all Java model files."""
        model_files = list(MODEL_DIR.glob("*.java"))
        
        # Exclude RankingSnapshot inner classes and embedded
        for file_path in model_files:
            if "RankingSnapshot" in file_path.stem and file_path.stem != "RankingSnapshot":
                continue
            
            model = self.parse_java_file(file_path)
            if model:
                self.models[model['class_name']] = model
        
        print(f"Parsed {len(self.models)} models")
        print(f"Found {len(self.relationships)} relationships")
    
    def generate_mermaid_erd(self) -> str:
        """Generate Mermaid ERD diagram."""
        lines = ["erDiagram", ""]
        
        # Define entities
        for class_name, model in sorted(self.models.items()):
            collection = model['collection']
            lines.append(f"    {class_name} {{")
            
            # Add primary key
            lines.append("        String _id PK")
            
            # Add fields
            for field in model['fields']:
                field_type = field['type']
                field_name = field['name']
                field_db = field['db_name']
                
                # Skip only the primary key _id field itself
                if field_db == '_id' and field_name == 'id':
                    continue
                
                # Format field
                index_marker = " UK" if field['unique'] else (" IDX" if field['indexed'] else "")
                lines.append(f"        {field_type} {field_db}{index_marker}")
            
            lines.append("    }")
            lines.append("")
        
        # Add relationships
        lines.append("    %% Relationships")
        processed_rels = set()
        
        for from_entity, to_entity, field in self.relationships:
            rel_key = f"{from_entity}->{to_entity}:{field}"
            if rel_key in processed_rels:
                continue
            
            # Determine cardinality
            if from_entity == to_entity:
                # Self-reference
                cardinality = "}o--||"
            elif field in ['follower_id', 'following_id', 'participants']:
                cardinality = "}o--o{"
            elif field in ['user_id', 'sender_id', 'receiver_id']:
                cardinality = "}o--||"
            elif field in ['post_id', 'comment_id', 'conversation_id', 'target_id']:
                cardinality = "}o--||"
            else:
                cardinality = "}o--||"
            
            lines.append(f"    {from_entity} {cardinality} {to_entity} : \"{field}\"")
            processed_rels.add(rel_key)
        
        return "\n".join(lines)
    
    def generate_readme(self) -> str:
        """Generate README with instructions."""
        return """# Database ERD (Entity Relationship Diagram)

This ERD diagram was automatically generated from Spring Boot MongoDB models.

## How to View the Diagram

### Option 1: Online Mermaid Editor (Easiest)
1. Go to https://mermaid.live/
2. Paste the contents of `ERD.mmd`
3. The diagram will render automatically
4. Click "Actions" > "Download PNG/SVG" to export as image

### Option 2: Using Mermaid CLI (Requires Node.js)
```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Generate PNG
mmdc -i ERD.mmd -o ERD.png

# Generate SVG (scalable)
mmdc -i ERD.mmd -o ERD.svg -t dark
```

### Option 3: VS Code Extension
1. Install "Markdown Preview Mermaid Support" extension
2. Open `ERD.mmd` file
3. Right-click > "Open Preview" or use Command Palette

### Option 4: GitHub/GitLab
Just push the `.mmd` file to your repository and GitHub/GitLab will render it automatically in markdown files.

## Regenerating the Diagram

Run the Python script:
```bash
cd photo-critique-be/scripts
python generate_erd.py
```

## Legend

- `PK` = Primary Key (_id)
- `UK` = Unique Index
- `IDX` = Indexed Field
- Relationships show field names that connect entities

## Collections

The following MongoDB collections are represented:

""" + "\n".join([f"- **{model['collection']}** ({class_name})" 
                  for class_name, model in sorted(self.models.items())])


def main():
    print("Starting ERD generation...")
    print(f"Looking for models in: {MODEL_DIR}")
    
    if not MODEL_DIR.exists():
        print(f"Error: Model directory not found: {MODEL_DIR}")
        return
    
    parser = ModelParser()
    parser.parse_all_models()
    
    # Generate Mermaid diagram
    mermaid_content = parser.generate_mermaid_erd()
    
    # Write files
    OUTPUT_MERMAID.write_text(mermaid_content, encoding='utf-8')
    print(f"\n[OK] Generated Mermaid diagram: {OUTPUT_MERMAID}")
    
    readme_content = parser.generate_readme()
    OUTPUT_README.write_text(readme_content, encoding='utf-8')
    print(f"[OK] Generated README: {OUTPUT_README}")
    
    print("\n" + "="*60)
    print("Next steps:")
    print("1. Open https://mermaid.live/")
    print("2. Copy contents of ERD.mmd and paste into editor")
    print("3. Click 'Actions' > 'Download PNG/SVG' to save as image")
    print("="*60)


if __name__ == "__main__":
    main()

