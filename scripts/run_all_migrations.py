import os
import sys

# Add psycopg2-binary for PostgreSQL connection
try:
    import psycopg2
except ImportError:
    print("Installing psycopg2-binary...")
    os.system(f"{sys.executable} -m pip install psycopg2-binary -q")
    import psycopg2

# Get database URL from environment
DATABASE_URL = os.environ.get('SUPABASE_POSTGRES_URL')

if not DATABASE_URL:
    print("❌ Error: SUPABASE_POSTGRES_URL environment variable not found")
    sys.exit(1)

print("🚀 Starting database setup...")
print("=" * 50)

# SQL scripts in order
scripts = [
    ('001_create_tables.sql', '📦 Creating tables...'),
    ('002_enable_rls.sql', '🔒 Enabling Row Level Security...'),
    ('003_seed_data.sql', '🌱 Seeding initial data...'),
    ('004_create_functions.sql', '⚙️  Creating functions and triggers...'),
    ('005_create_admin_trigger.sql', '👤 Setting up admin user trigger...')
]

try:
    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("✅ Connected to database\n")
    
    # Execute each script
    for script_name, description in scripts:
        print(description)
        
        # Read SQL file
        script_path = os.path.join(os.path.dirname(__file__), script_name)
        with open(script_path, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        # Execute SQL
        try:
            cursor.execute(sql)
            print(f"   ✅ {script_name} executed successfully\n")
        except Exception as e:
            print(f"   ⚠️  Warning in {script_name}: {str(e)}\n")
            # Continue with other scripts even if one fails
    
    # Verify tables were created
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    
    print("=" * 50)
    print("✅ Database setup complete!")
    print(f"\n📊 Created {len(tables)} tables:")
    for table in tables:
        print(f"   • {table[0]}")
    
    print("\n🎉 Your database is ready!")
    print("\n📝 Next steps:")
    print("   1. Go to /admin/login")
    print("   2. Click 'Sign Up' to create an admin account")
    print("   3. Use your email and password to login")
    print("   4. Start managing your restaurant!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    sys.exit(1)
