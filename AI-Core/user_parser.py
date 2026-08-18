import sys
import json

def parse_and_save_user(raw_data):
    try:
        # Clean and load JSON data coming from Node.js
        user_data = json.loads(raw_data)
        username = user_data.get("username")
        email = user_data.get("email")

        # Validation check
        if not username or not email:
            print(json.dumps({"error": "Missing username or email fields"}))
            return

        # Generate the corresponding SQL command for your storage layer
        sql_query = f"INSERT INTO user_accounts (username, email) VALUES ('{username}', '{email}');"

        # Construct response package back to Node.js / HTML frontend
        response = {
            "status": "success",
            "username": username,
            "email": email,
            "sql_command": sql_query,
            "message": "User successfully parsed and SQL record generated."
        }
        
        print(json.dumps(response))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        parse_and_save_user(sys.argv[1])
    else:
        print(json.dumps({"error": "No payload received by Python parser"}))
