require('dotenv').config();
const { sequelize, User, Address, Restaurant, MenuItem, Coupon } = require('./models');

const seedData = async () => {
  try {
    console.log('🔄 Connecting to PostgreSQL...');
    await sequelize.authenticate();
    
    console.log('🗑️  Dropping all tables and recreating...');
    await sequelize.sync({ force: true });
    
    // Create users (Password hashing is handled by the beforeCreate hook in the User model)
    const users = await User.bulkCreate([
      { name: 'Admin User', email: 'admin@annseva.com', password: 'admin123', role: 'admin', phone: '9876543210' },
      { name: 'Restaurant Owner', email: 'restaurant@annseva.com', password: 'rest123', role: 'restaurant', phone: '9876543211' },
      { name: 'Soham Chintawar', email: 'soham@gmail.com', password: 'user123', role: 'customer', phone: '9876543212' },
      { name: 'Priya Sharma', email: 'priya@gmail.com', password: 'user123', role: 'customer', phone: '9876543213' },
      { name: 'Rahul Patel', email: 'rahul@gmail.com', password: 'user123', role: 'customer', phone: '9876543214' },
    ], { individualHooks: true, returning: true });

    console.log('👥 Users created');

    // Add address for Soham
    await Address.create({
      userId: users[2].id,
      label: 'Home',
      street: '123 MG Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      phone: '9876543212',
      isDefault: true
    });
    
    console.log('🏠 Address created');

    // Create restaurants
    const restaurants = await Restaurant.bulkCreate([
      {
        name: 'Spice Garden',
        description: 'Authentic Indian cuisine with a modern twist. Our chefs bring the flavors of India to your doorstep.',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        cuisine: ['North Indian', 'Mughlai', 'Biryani'],
        address: { street: 'FC Road', city: 'Pune', state: 'Maharashtra', pincode: '411005' },
        phone: '020-12345678',
        ownerId: users[1].id,
        rating: 4.5,
        numReviews: 128,
        deliveryTime: '30-40 min',
        deliveryCharge: 30,
        minOrder: 150,
      },
      {
        name: 'Pizza Paradise',
        description: 'Wood-fired pizzas and Italian delights. Experience authentic Italian flavors crafted with love.',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        cuisine: ['Italian', 'Pizza', 'Pasta'],
        address: { street: 'Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
        phone: '020-23456789',
        ownerId: users[1].id,
        rating: 4.3,
        numReviews: 95,
        deliveryTime: '25-35 min',
        deliveryCharge: 25,
        minOrder: 200,
      },
      {
        name: 'Dragon Wok',
        description: 'Pan-Asian cuisine at its finest. From dim sums to stir-fry, we have it all.',
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
        cuisine: ['Chinese', 'Thai', 'Asian'],
        address: { street: 'Hinjewadi', city: 'Pune', state: 'Maharashtra', pincode: '411057' },
        phone: '020-34567890',
        ownerId: users[1].id,
        rating: 4.1,
        numReviews: 72,
        deliveryTime: '35-45 min',
        deliveryCharge: 40,
        minOrder: 180,
      },
      {
        name: 'Burger Barn',
        description: 'Juicy burgers, crispy fries, and thick shakes. The ultimate burger experience awaits you.',
        image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
        cuisine: ['American', 'Burgers', 'Fast Food'],
        address: { street: 'Viman Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411014' },
        phone: '020-45678901',
        ownerId: users[1].id,
        rating: 4.4,
        numReviews: 156,
        deliveryTime: '20-30 min',
        deliveryCharge: 20,
        minOrder: 100,
      },
      {
        name: 'South Spice',
        description: 'Traditional South Indian delicacies. From crispy dosas to fluffy idlis.',
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        cuisine: ['South Indian', 'Kerala', 'Dosa'],
        address: { street: 'Kothrud', city: 'Pune', state: 'Maharashtra', pincode: '411038' },
        phone: '020-56789012',
        ownerId: users[1].id,
        rating: 4.6,
        numReviews: 203,
        deliveryTime: '25-35 min',
        deliveryCharge: 25,
        minOrder: 120,
      },
      {
        name: 'Sweet Tooth Bakery',
        description: 'Freshly baked cakes, pastries, and desserts. Indulge your sweet cravings!',
        image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800',
        cuisine: ['Bakery', 'Desserts', 'Cakes'],
        address: { street: 'Baner', city: 'Pune', state: 'Maharashtra', pincode: '411045' },
        phone: '020-67890123',
        ownerId: users[1].id,
        rating: 4.7,
        numReviews: 180,
        deliveryTime: '30-40 min',
        deliveryCharge: 35,
        minOrder: 200,
      },
    ], { returning: true });

    console.log('🏪 Restaurants created');

    // Create menu items
    await MenuItem.bulkCreate([
      // Spice Garden items
      { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken pieces, infused with aromatic spices', price: 320, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500', category: 'main-course', restaurantId: restaurants[0].id, isVeg: false, rating: 4.6, numReviews: 45 },
      { name: 'Paneer Tikka Masala', description: 'Chunks of paneer in a rich, spiced gravy with bell peppers and onions', price: 280, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', category: 'main-course', restaurantId: restaurants[0].id, isVeg: true, rating: 4.4, numReviews: 38 },
      { name: 'Hyderabadi Biryani', description: 'Fragrant basmati rice layered with spiced meat and saffron, slow-cooked to perfection', price: 350, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500', category: 'biryani', restaurantId: restaurants[0].id, isVeg: false, rating: 4.8, numReviews: 67 },
      { name: 'Dal Makhani', description: 'Black lentils slow-cooked with cream and butter, a classic North Indian delicacy', price: 220, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500', category: 'main-course', restaurantId: restaurants[0].id, isVeg: true, rating: 4.3, numReviews: 28 },
      { name: 'Samosa (2 pcs)', description: 'Crispy golden pastry stuffed with spiced potatoes and peas', price: 80, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500', category: 'starters', restaurantId: restaurants[0].id, isVeg: true, rating: 4.2, numReviews: 52 },
      { name: 'Gulab Jamun (4 pcs)', description: 'Soft, spongy milk-solid balls soaked in rose-flavored sugar syrup', price: 120, image: 'https://images.unsplash.com/photo-1666190440743-bc32f0bb1afe?w=500', category: 'desserts', restaurantId: restaurants[0].id, isVeg: true, rating: 4.5, numReviews: 33 },
      { name: 'Mango Lassi', description: 'Refreshing yogurt drink blended with ripe mangoes and a hint of cardamom', price: 90, image: 'https://images.unsplash.com/photo-1527685609591-44b0aef2400b?w=500', category: 'beverages', restaurantId: restaurants[0].id, isVeg: true, rating: 4.4, numReviews: 41 },

      // Pizza Paradise items
      { name: 'Margherita Pizza', description: 'Classic pizza with mozzarella, fresh basil, and San Marzano tomato sauce', price: 299, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500', category: 'pizza', restaurantId: restaurants[1].id, isVeg: true, rating: 4.5, numReviews: 44 },
      { name: 'Pepperoni Supreme', description: 'Loaded with double pepperoni, mozzarella, and our signature spicy sauce', price: 449, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500', category: 'pizza', restaurantId: restaurants[1].id, isVeg: false, rating: 4.6, numReviews: 51 },
      { name: 'Farmhouse Pizza', description: 'Fresh vegetables, mushrooms, olives, and capsicum on a cheesy base', price: 379, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500', category: 'pizza', restaurantId: restaurants[1].id, isVeg: true, rating: 4.3, numReviews: 36 },
      { name: 'Pasta Alfredo', description: 'Creamy white sauce pasta with mushrooms and parmesan cheese', price: 259, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500', category: 'main-course', restaurantId: restaurants[1].id, isVeg: true, rating: 4.2, numReviews: 29 },
      { name: 'Garlic Bread', description: 'Crispy baked bread with herb butter and melted cheese', price: 149, image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=500', category: 'starters', restaurantId: restaurants[1].id, isVeg: true, rating: 4.4, numReviews: 47 },
      { name: 'Tiramisu', description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream', price: 199, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500', category: 'desserts', restaurantId: restaurants[1].id, isVeg: true, rating: 4.7, numReviews: 38 },

      // Dragon Wok items
      { name: 'Kung Pao Chicken', description: 'Stir-fried chicken with peanuts, vegetables, and chili peppers in a savory sauce', price: 290, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500', category: 'chinese', restaurantId: restaurants[2].id, isVeg: false, rating: 4.3, numReviews: 32 },
      { name: 'Veg Manchurian', description: 'Crispy vegetable balls tossed in a tangy, spicy Manchurian sauce', price: 220, image: 'https://images.unsplash.com/photo-1645696301019-35adcc18a369?w=500', category: 'chinese', restaurantId: restaurants[2].id, isVeg: true, rating: 4.1, numReviews: 26 },
      { name: 'Fried Rice', description: 'Wok-tossed rice with seasonal vegetables, soy sauce, and aromatic spices', price: 200, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500', category: 'chinese', restaurantId: restaurants[2].id, isVeg: true, rating: 4.0, numReviews: 22 },
      { name: 'Dim Sum Platter', description: 'Assorted steamed dumplings with dipping sauces — a dim sum lover\'s dream', price: 340, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500', category: 'starters', restaurantId: restaurants[2].id, isVeg: false, rating: 4.5, numReviews: 29 },
      { name: 'Thai Green Curry', description: 'Coconut milk-based curry with Thai basil, bamboo shoots, and your choice of protein', price: 310, image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=500', category: 'main-course', restaurantId: restaurants[2].id, isVeg: false, rating: 4.4, numReviews: 27 },

      // Burger Barn items
      { name: 'Classic Smash Burger', description: 'Double smashed beef patties with American cheese, pickles, and special sauce', price: 249, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', category: 'burger', restaurantId: restaurants[3].id, isVeg: false, rating: 4.5, numReviews: 63 },
      { name: 'Crispy Chicken Burger', description: 'Buttermilk-fried chicken breast with coleslaw and spicy mayo', price: 229, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500', category: 'burger', restaurantId: restaurants[3].id, isVeg: false, rating: 4.4, numReviews: 48 },
      { name: 'Veggie Deluxe Burger', description: 'Grilled veggie patty with avocado, lettuce, tomato, and chipotle sauce', price: 199, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500', category: 'burger', restaurantId: restaurants[3].id, isVeg: true, rating: 4.2, numReviews: 31 },
      { name: 'Loaded Fries', description: 'Crispy fries topped with melted cheese, bacon bits, jalapeños, and sour cream', price: 179, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500', category: 'snacks', restaurantId: restaurants[3].id, isVeg: false, rating: 4.6, numReviews: 57 },
      { name: 'Oreo Milkshake', description: 'Thick and creamy milkshake blended with Oreo cookies and vanilla ice cream', price: 149, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500', category: 'beverages', restaurantId: restaurants[3].id, isVeg: true, rating: 4.7, numReviews: 42 },

      // South Spice items
      { name: 'Masala Dosa', description: 'Crispy rice and lentil crepe filled with spiced potato filling, served with chutneys', price: 120, image: 'https://images.unsplash.com/photo-1668236543090-82eb5eade55d?w=500', category: 'south-indian', restaurantId: restaurants[4].id, isVeg: true, rating: 4.6, numReviews: 78 },
      { name: 'Idli Sambar (4 pcs)', description: 'Steamed rice cakes served with hot sambar and coconut chutney', price: 90, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', category: 'south-indian', restaurantId: restaurants[4].id, isVeg: true, rating: 4.4, numReviews: 55 },
      { name: 'Chettinad Chicken', description: 'Spicy chicken curry from Tamil Nadu with freshly ground masala', price: 310, image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500', category: 'main-course', restaurantId: restaurants[4].id, isVeg: false, rating: 4.5, numReviews: 41 },
      { name: 'Uttapam', description: 'Thick rice pancake topped with onions, tomatoes, and green chilies', price: 110, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=500', category: 'south-indian', restaurantId: restaurants[4].id, isVeg: true, rating: 4.3, numReviews: 32 },
      { name: 'Filter Coffee', description: 'Traditional South Indian filter coffee — strong, aromatic, and frothy', price: 60, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500', category: 'beverages', restaurantId: restaurants[4].id, isVeg: true, rating: 4.8, numReviews: 89 },

      // Sweet Tooth Bakery items
      { name: 'Chocolate Truffle Cake', description: 'Rich, decadent chocolate cake with layers of chocolate ganache', price: 450, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', category: 'desserts', restaurantId: restaurants[5].id, isVeg: true, rating: 4.8, numReviews: 67 },
      { name: 'Red Velvet Cupcakes (4)', description: 'Moist red velvet cupcakes with cream cheese frosting', price: 280, image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500', category: 'desserts', restaurantId: restaurants[5].id, isVeg: true, rating: 4.6, numReviews: 45 },
      { name: 'Blueberry Cheesecake', description: 'New York-style cheesecake with fresh blueberry compote', price: 380, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500', category: 'desserts', restaurantId: restaurants[5].id, isVeg: true, rating: 4.7, numReviews: 52 },
      { name: 'Croissant (2 pcs)', description: 'Buttery, flaky French croissants, freshly baked every morning', price: 160, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=500', category: 'snacks', restaurantId: restaurants[5].id, isVeg: true, rating: 4.5, numReviews: 38 },
      { name: 'Iced Caramel Latte', description: 'Cold brew coffee with caramel syrup and milk over ice', price: 180, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500', category: 'beverages', restaurantId: restaurants[5].id, isVeg: true, rating: 4.4, numReviews: 33 },
    ]);

    console.log('🍕 Menu items created');

    // Create coupons
    await Coupon.bulkCreate([
      { code: 'WELCOME50', discountType: 'percentage', discountValue: 50, minOrder: 200, maxDiscount: 100, expiresAt: new Date('2027-12-31'), description: '50% off on your first order (up to ₹100)' },
      { code: 'FOODIE20', discountType: 'percentage', discountValue: 20, minOrder: 300, maxDiscount: 150, expiresAt: new Date('2027-12-31'), description: '20% off on orders above ₹300' },
      { code: 'FLAT100', discountType: 'flat', discountValue: 100, minOrder: 500, maxDiscount: 100, expiresAt: new Date('2027-12-31'), description: 'Flat ₹100 off on orders above ₹500' },
      { code: 'FREEDELIVERY', discountType: 'flat', discountValue: 40, minOrder: 150, maxDiscount: 40, expiresAt: new Date('2027-12-31'), description: 'Free delivery on orders above ₹150' },
    ]);

    console.log('🎟️  Coupons created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('   Admin:      admin@annseva.com / admin123');
    console.log('   Restaurant: restaurant@annseva.com / rest123');
    console.log('   Customer:   soham@gmail.com / user123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
