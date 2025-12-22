# Database ERD (Entity Relationship Diagram)

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

- **ai_requests** (AIRequest)
- **badges** (Badge)
- **comments** (Comment)
- **conversations** (Conversation)
- **follows** (Follow)
- **messages** (Message)
- **notifications** (Notification)
- **posts** (Post)
- **reactions** (Reaction)
- **saved_posts** (SavedPost)
- **shares** (Share)
- **tags** (Tag)
- **users** (User)
- **xp_configs** (XPConfig)
- **xp_events** (XPEvent)