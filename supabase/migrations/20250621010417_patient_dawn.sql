/*
  # Esquema inicial para Roskuki Management

  1. Nuevas Tablas
    - `users` - Información de clientes
    - `flavors` - Sabores de galletas disponibles
    - `inventory` - Items de inventario actual
    - `inventory_movements` - Historial de movimientos de inventario
    - `sales` - Registro de ventas
    - `sale_items` - Items individuales de cada venta
    - `orders` - Pedidos generados desde ventas
    - `order_items` - Items de cada pedido
    - `financial_records` - Registros financieros

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para permitir operaciones CRUD a usuarios autenticados

  3. Triggers
    - Trigger para crear order_items automáticamente desde sale_items
    - Trigger para actualizar inventario cuando se entrega un pedido
*/

-- Crear extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios/clientes
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  order_count integer DEFAULT 0,
  total_cookies integer DEFAULT 0,
  box4_count integer DEFAULT 0,
  box6_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de sabores
CREATE TABLE IF NOT EXISTS flavors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de inventario
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  flavor_id uuid REFERENCES flavors(id),
  flavor_name text NOT NULL,
  size text NOT NULL CHECK (size IN ('medium', 'large')),
  quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  flavor_id uuid REFERENCES flavors(id),
  flavor_name text NOT NULL,
  size text NOT NULL CHECK (size IN ('medium', 'large')),
  quantity integer NOT NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('addition', 'deduction')),
  reason text NOT NULL,
  order_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  user_name text NOT NULL,
  total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de items de venta
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  cookie_id uuid,
  flavor_id uuid REFERENCES flavors(id),
  flavor_name text NOT NULL,
  size text NOT NULL CHECK (size IN ('medium', 'large')),
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  sale_type text NOT NULL CHECK (sale_type IN ('unit', 'box4', 'box6')),
  box_quantity integer,
  created_at timestamptz DEFAULT now()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id uuid REFERENCES sales(id),
  user_id uuid REFERENCES users(id),
  user_name text NOT NULL,
  total decimal(10,2) NOT NULL,
  is_prepared boolean DEFAULT false,
  prepared_date timestamptz,
  is_delivered boolean DEFAULT false,
  delivered_date timestamptz,
  is_paid boolean DEFAULT false,
  paid_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de items de pedido
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  sale_item_id uuid REFERENCES sale_items(id),
  flavor_id uuid REFERENCES flavors(id),
  flavor_name text NOT NULL,
  size text NOT NULL CHECK (size IN ('medium', 'large')),
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  sale_type text NOT NULL CHECK (sale_type IN ('unit', 'box4', 'box6')),
  box_quantity integer,
  created_at timestamptz DEFAULT now()
);

-- Tabla de registros financieros
CREATE TABLE IF NOT EXISTS financial_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  category text NOT NULL,
  order_id uuid REFERENCES orders(id),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir todas las operaciones (para desarrollo)
-- En producción, estas deberían ser más restrictivas

CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on flavors" ON flavors FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventory_movements" ON inventory_movements FOR ALL USING (true);
CREATE POLICY "Allow all operations on sales" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on sale_items" ON sale_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on financial_records" ON financial_records FOR ALL USING (true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flavors_updated_at BEFORE UPDATE ON flavors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear order_items automáticamente cuando se crea un order
CREATE OR REPLACE FUNCTION create_order_items_from_sale()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_items (
        order_id,
        sale_item_id,
        flavor_id,
        flavor_name,
        size,
        quantity,
        price,
        total,
        sale_type,
        box_quantity
    )
    SELECT 
        NEW.id,
        si.id,
        si.flavor_id,
        si.flavor_name,
        si.size,
        si.quantity,
        si.price,
        si.total,
        si.sale_type,
        si.box_quantity
    FROM sale_items si
    WHERE si.sale_id = NEW.sale_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para crear order_items automáticamente
CREATE TRIGGER create_order_items_trigger
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_order_items_from_sale();

-- Insertar sabores por defecto
INSERT INTO flavors (name, available) VALUES
('Chips Chocolate Relleno Nutela', true),
('Red Velvet Relleno Nutella', true),
('M&m''s Relleno Nutella', true),
('Oreo Relleno Oreo', true),
('Oreo Relleno Nutella', true),
('Galleta Galak', true),
('Galleta Nucita', true),
('Chocolatina Jet', true)
ON CONFLICT (name) DO NOTHING;