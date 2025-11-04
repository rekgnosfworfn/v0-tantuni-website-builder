#!/usr/bin/env python3
"""
Run SQL migration: 006_add_username_auth.sql
Adds username and password authentication for admin users
"""

import os
import sys
from pathlib import Path

# Add the parent directory to sys.path to import the database module
sys.path.append(str(Path(__file__).parent.parent))

try:
    from scripts.database import run_sql_file
except ImportError:
    print("Error: Could not import database module.")
    print("Make sure you have the required dependencies installed.")
    sys.exit(1)

def main():
    """Run the migration"""
    script_dir = Path(__file__).parent
    sql_file = script_dir / "006_add_username_auth.sql"

    if not sql_file.exists():
        print(f"Error: SQL file not found: {sql_file}")
        sys.exit(1)

    print("Running migration: 006_add_username_auth.sql")
    print("This will add username/password authentication to admin_users table")
    print()

    try:
        run_sql_file(sql_file)
        print()
        print("✓ Migration completed successfully!")
        print()
        print("Default admin credentials created:")
        print("  Username: admin")
        print("  Password: admin123")
        print()
        print("⚠️  Please change the default password after first login!")
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
