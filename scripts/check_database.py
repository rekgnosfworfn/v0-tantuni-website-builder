import os
import sys

try:
    import psycopg2
except ImportError:
    print("Installing psycopg2-binary...")
    os.system(f"{sys.executable} -m pip install psycopg2-binary -q")
    import psycopg2

DATABASE_URL = os.environ.get('SUPABASE_POSTGRES_URL')

if not DATABASE_URL:
    print("❌ Error: SUPABASE_POSTGRES_URL environment variable not found")
    sys.exit(1)

print("🔍 Checking database status...")
print("=" * 50)

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    
    print(f"\n📊 Tables ({len(tables)}):")
    for table in tables:
        table_name = table[0]
        
        # Count rows in each table
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        
        print(f"   • {table_name}: {count} rows")
    
    # Check categories
    cursor.execute("SELECT name, slug FROM categories ORDER BY display_order;")
    categories = cursor.fetchall()
    
    if categories:
        print(f"\n📁 Categories ({len(categories)}):")
        for cat in categories:
            print(f"   • {cat[0]} ({cat[1]})")
    
    # Check products
    cursor.execute("""
        SELECT p.name, c.name as category, p.price, p.is_available 
        FROM products p 
        JOIN categories c ON p.category_id = c.id 
        ORDER BY c.display_order, p.display_order;
    """)
    products = cursor.fetchall()
    
    if products:
        print(f"\n🍽️  Products ({len(products)}):")
        for prod in products:
            status = "✅" if prod[3] else "❌"
            print(f"   {status} {prod[0]} ({prod[1]}) - {prod[2]} TL")
    
    # Check orders
    cursor.execute("SELECT COUNT(*) FROM orders;")
    order_count = cursor.fetchone()[0]
    
    if order_count > 0:
        cursor.execute("""
            SELECT order_number, order_type, status, total_amount, created_at 
            FROM orders 
            ORDER BY created_at DESC 
            LIMIT 5;
        """)
        orders = cursor.fetchall()
        
        print(f"\n📦 Recent Orders ({order_count} total):")
        for order in orders:
            print(f"   • {order[0]} - {order[1]} - {order[2]} - {order[3]} TL")
    
    # Check admin users
    cursor.execute("SELECT email, full_name FROM admin_users;")
    admins = cursor.fetchall()
    
    if admins:
        print(f"\n👤 Admin Users ({len(admins)}):")
        for admin in admins:
            print(f"   • {admin[0]} ({admin[1] or 'No name'})")
    else:
        print("\n👤 Admin Users: None yet")
        print("   ℹ️  Create an admin account at /admin/login")
    
    print("\n" + "=" * 50)
    print("✅ Database check complete!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    sys.exit(1)
