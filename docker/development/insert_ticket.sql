INSERT INTO product_prices (product_id, price, label, initial_quantity_available, quantity_available, "order", created_at, updated_at)
VALUES (1, 0.00, 'Free', 500, 500, 1, NOW(), NOW())
RETURNING id, product_id, price, quantity_available;
