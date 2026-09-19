docker run -it --rm `
--name n8n `
-p 5678:5678 `
-e GENERIC_TIMEZONE="Asia/Kolkata" `
-e TZ="Asia/Kolkata" `
-e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true `
-e N8N_RESTRICT_FILE_ACCESS_TO=/files `
-v n8n_data:/home/node/.n8n `
-v n8n_files:/files `
docker.n8n.io/n8nio/n8n