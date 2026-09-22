require('dotenv').config();
const { sequelize, User, Restaurant, MenuItem, Coupon } = require('./models');

const addExtra = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected');

    const owner = await User.findOne({ where: { role: 'restaurant' } });
    if (!owner) { console.log('❌ No restaurant owner found. Run seeder.js first.'); process.exit(1); }

    // 4 New Premium Restaurants
    const newRests = await Restaurant.bulkCreate([
      {
        name: 'Tandoori Flames',
        description: 'Premium tandoor & grill — signature kebabs, naan, and smoky flavors straight from the clay oven.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        cuisine: ['North Indian', 'Tandoor', 'Mughlai'],
        address: { street: 'JM Road', city: 'Pune', state: 'Maharashtra', pincode: '411004' },
        phone: '020-77001100', ownerId: owner.id,
        rating: 4.7, numReviews: 245, deliveryTime: '30-40 min', deliveryCharge: 30, minOrder: 200,
      },
      {
        name: 'Sushi & More',
        description: 'Premium Japanese dining — fresh sushi rolls, ramen bowls, and authentic Japanese flavors.',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
        cuisine: ['Japanese', 'Sushi', 'Asian'],
        address: { street: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411006' },
        phone: '020-77002200', ownerId: owner.id,
        rating: 4.5, numReviews: 132, deliveryTime: '35-50 min', deliveryCharge: 50, minOrder: 300,
      },
      {
        name: 'Maharaja Thali House',
        description: 'Royal Maharashtrian & Rajasthani thalis — a grand feast of 15+ dishes on one plate.',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
        cuisine: ['Maharashtrian', 'Rajasthani', 'Thali'],
        address: { street: 'Shivaji Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411005' },
        phone: '020-77003300', ownerId: owner.id,
        rating: 4.8, numReviews: 310, deliveryTime: '25-35 min', deliveryCharge: 20, minOrder: 150,
      },
      {
        name: 'The Protein Bowl',
        description: 'Healthy, high-protein meals — smoothie bowls, grilled chicken, salads & guilt-free desserts.',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        cuisine: ['Healthy', 'Salads', 'Continental'],
        address: { street: 'Aundh', city: 'Pune', state: 'Maharashtra', pincode: '411007' },
        phone: '020-77004400', ownerId: owner.id,
        rating: 4.4, numReviews: 178, deliveryTime: '20-30 min', deliveryCharge: 25, minOrder: 180,
      },
    ], { returning: true });

    console.log('🏪 4 New restaurants added');

    // Premium Menu Items
    await MenuItem.bulkCreate([
      // Tandoori Flames
      { name: 'Chicken Seekh Kebab', description: 'Minced chicken skewers with aromatic spices, chargrilled in tandoor', price: 280, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500', category: 'starters', restaurantId: newRests[0].id, isVeg: false, rating: 4.7, numReviews: 58 },
      { name: 'Paneer Tikka', description: 'Marinated cottage cheese cubes grilled with peppers and onions', price: 240, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500', category: 'starters', restaurantId: newRests[0].id, isVeg: true, rating: 4.6, numReviews: 72 },
      { name: 'Mutton Rogan Josh', description: 'Kashmiri-style slow-cooked lamb in rich red gravy with whole spices', price: 420, image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=500', category: 'main-course', restaurantId: newRests[0].id, isVeg: false, rating: 4.8, numReviews: 45 },
      { name: 'Butter Naan', description: 'Soft, fluffy tandoori bread brushed with melted butter', price: 60, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500', category: 'main-course', restaurantId: newRests[0].id, isVeg: true, rating: 4.5, numReviews: 90 },
      { name: 'Lucknowi Biryani', description: 'Awadhi-style dum biryani with saffron, rose water and tender meat', price: 380, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500', category: 'biryani', restaurantId: newRests[0].id, isVeg: false, rating: 4.9, numReviews: 102 },
      { name: 'Rabri Jalebi', description: 'Crispy hot jalebis served with thick, creamy rabri', price: 150, image: 'https://images.unsplash.com/photo-1666190440743-bc32f0bb1afe?w=500', category: 'desserts', restaurantId: newRests[0].id, isVeg: true, rating: 4.6, numReviews: 65 },

      // Sushi & More
      { name: 'California Roll (8 pcs)', description: 'Classic inside-out roll with crab, avocado, and cucumber', price: 420, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500', category: 'starters', restaurantId: newRests[1].id, isVeg: false, rating: 4.5, numReviews: 48 },
      { name: 'Spicy Tuna Roll', description: 'Fresh tuna with spicy mayo, sesame seeds, and tempura crunch', price: 480, image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500', category: 'starters', restaurantId: newRests[1].id, isVeg: false, rating: 4.6, numReviews: 35 },
      { name: 'Tonkotsu Ramen', description: 'Rich pork bone broth with chashu, soft-boiled egg, nori, and noodles', price: 450, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', category: 'main-course', restaurantId: newRests[1].id, isVeg: false, rating: 4.7, numReviews: 52 },
      { name: 'Veg Tempura Platter', description: 'Crispy battered vegetables with tentsuyu dipping sauce', price: 320, image: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=500', category: 'starters', restaurantId: newRests[1].id, isVeg: true, rating: 4.3, numReviews: 28 },
      { name: 'Matcha Ice Cream', description: 'Authentic Japanese green tea ice cream — creamy and earthy', price: 180, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500', category: 'desserts', restaurantId: newRests[1].id, isVeg: true, rating: 4.4, numReviews: 42 },

      // Maharaja Thali House
      { name: 'Maharaja Veg Thali', description: 'Royal platter: 4 sabzis, dal, rice, 3 rotis, raita, papad, pickle & sweet', price: 299, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500', category: 'main-course', restaurantId: newRests[2].id, isVeg: true, rating: 4.8, numReviews: 125 },
      { name: 'Non-Veg Royal Thali', description: 'Grand feast: chicken curry, mutton, biryani, dal, rotis, raita & dessert', price: 449, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500', category: 'main-course', restaurantId: newRests[2].id, isVeg: false, rating: 4.9, numReviews: 98 },
      { name: 'Misal Pav', description: 'Spicy Maharashtrian sprouted moth curry topped with farsan, served with pav', price: 120, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=500', category: 'snacks', restaurantId: newRests[2].id, isVeg: true, rating: 4.7, numReviews: 88 },
      { name: 'Vada Pav', description: 'Mumbai\'s iconic street food — spicy potato fritter in soft bread with chutneys', price: 50, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=500', category: 'snacks', restaurantId: newRests[2].id, isVeg: true, rating: 4.6, numReviews: 150 },
      { name: 'Puran Poli (2 pcs)', description: 'Sweet Maharashtrian flatbread stuffed with jaggery-lentil filling', price: 100, image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=500', category: 'desserts', restaurantId: newRests[2].id, isVeg: true, rating: 4.5, numReviews: 75 },
      { name: 'Sol Kadhi', description: 'Refreshing kokum-coconut milk drink — perfect Konkani digestif', price: 70, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500', category: 'beverages', restaurantId: newRests[2].id, isVeg: true, rating: 4.4, numReviews: 60 },

      // The Protein Bowl
      { name: 'Grilled Chicken Bowl', description: 'Herb-grilled chicken breast with quinoa, roasted veggies & tahini drizzle', price: 350, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', category: 'main-course', restaurantId: newRests[3].id, isVeg: false, rating: 4.5, numReviews: 62 },
      { name: 'Açaí Smoothie Bowl', description: 'Blended açaí with banana, granola, fresh berries, chia seeds & honey', price: 280, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500', category: 'beverages', restaurantId: newRests[3].id, isVeg: true, rating: 4.6, numReviews: 55 },
      { name: 'Caesar Salad', description: 'Crisp romaine, parmesan, croutons, grilled chicken & classic caesar dressing', price: 260, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500', category: 'starters', restaurantId: newRests[3].id, isVeg: false, rating: 4.3, numReviews: 40 },
      { name: 'Avocado Toast', description: 'Sourdough toast with smashed avocado, cherry tomatoes, feta & microgreens', price: 220, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500', category: 'snacks', restaurantId: newRests[3].id, isVeg: true, rating: 4.4, numReviews: 48 },
      { name: 'Protein Shake', description: 'Whey protein blended with banana, peanut butter, oats & almond milk', price: 180, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500', category: 'beverages', restaurantId: newRests[3].id, isVeg: true, rating: 4.5, numReviews: 70 },
      { name: 'Dark Choco Oat Bar', description: 'Guilt-free dark chocolate oat bar — no sugar added, high fiber', price: 120, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=500', category: 'desserts', restaurantId: newRests[3].id, isVeg: true, rating: 4.2, numReviews: 35 },
    ]);

    console.log('🍛 Premium menu items added');

    // Extra coupons
    await Coupon.bulkCreate([
      { code: 'ANNSEVA30', discountType: 'percentage', discountValue: 30, minOrder: 400, maxDiscount: 200, expiresAt: new Date('2027-12-31'), description: '30% off on orders above ₹400 (max ₹200)' },
      { code: 'THALI99', discountType: 'flat', discountValue: 99, minOrder: 250, maxDiscount: 99, expiresAt: new Date('2027-12-31'), description: 'Flat ₹99 off on thali orders above ₹250' },
    ]);

    console.log('🎟️  Extra coupons added');
    console.log('\n✅ Extra data added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

addExtra();
