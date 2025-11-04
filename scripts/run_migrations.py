import os
import sys

# Get database URL from environment
database_url = os.environ.get('SUPABASE_POSTGRES_URL')

if not database_url:
    print("❌ SUPABASE_POSTGRES_URL environment variable not found!")
    sys.exit(1)

print("🔄 Starting database setup...")
print(f"📊 Database URL: {database_url[:30]}...")

try:
    import psycopg2
    
    # Connect to database
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("✅ Connected to database successfully!")
    
    # List of SQL files to execute in order
    sql_files = [
        '001_create_tables.sql',
        '002_enable_rls.sql',
        '003_seed_data.sql',
        '004_create_functions.sql',
        '005_create_admin_trigger.sql'
    ]
    
    # Execute each SQL file
    for sql_file in sql_files:
        file_path = f'scripts/{sql_file}'
        print(f"\n🔄 Executing {sql_file}...")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                sql_content = f.read()
                
            # Execute the SQL
            cursor.execute(sql_content)
            print(f"✅ {sql_file} executed successfully!")
            
        except Exception as e:
            print(f"❌ Error executing {sql_file}: {str(e)}")
            continue
    
    # Verify tables were created
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    print(f"\n✅ Database setup complete!")
    print(f"📊 Created {len(tables)} tables:")
    for table in tables:
        print(f"   - {table[0]}")
    
    # Check if we have sample data
    cursor.execute("SELECT COUNT(*) FROM categories;")
    cat_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM products;")
    prod_count = cursor.fetchone()[0]
    
    print(f"\n📦 Sample data:")
    print(f"   - {cat_count} categories")
    print(f"   - {prod_count} products")
    
    cursor.close()
    conn.close()
    
    print("\n🎉 Database is ready to use!")
    print("\n📝 Next steps:")
    print("   1. Go to /admin/login")
    print("   2. Click 'Sign Up' to create an admin account")
    print("   3. Use your email and password to login")
    
except ImportError:
    print("❌ psycopg2 not installed. Installing...")
    os.system(f"{sys.executable} -m pip install psycopg2-binary")
    print("✅ Please run the script again.")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    sys.exit(1)
