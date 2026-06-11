/* ============================================================
   EcoGenie — Data Module
   Comprehensive data for carbon calculations, gamification,
   community, and AI coach responses
   ============================================================ */

const EcoData = {
  /* ── Emission Factors ── */
  emissionFactors: {
    transport: {
      car_petrol: 0.21,
      car_diesel: 0.17,
      car_electric: 0.05,
      bus: 0.089,
      train: 0.041,
      metro: 0.033,
      bicycle: 0,
      walking: 0,
      motorcycle: 0.113,
      flight_domestic: 0.255,
      flight_international: 0.195,
      auto_rickshaw: 0.06,
      carpool: 0.07,
      scooter_electric: 0.02,
      ferry: 0.19
    },
    electricity: {
      perKwh: 0.42,
      solar: 0.05,
      wind: 0.01,
      coal: 0.91,
      natural_gas: 0.45,
      nuclear: 0.012
    },
    water: {
      perLiter: 0.000298,
      hotWaterPerLiter: 0.0032
    },
    food: {
      beef: 27.0,
      lamb: 39.2,
      pork: 12.1,
      chicken: 6.9,
      fish: 6.1,
      eggs: 4.8,
      dairy: 3.2,
      cheese: 13.5,
      rice: 2.7,
      wheat: 1.4,
      vegetables: 2.0,
      fruits: 1.1,
      legumes: 0.9,
      nuts: 2.3,
      tofu: 2.0,
      coffee: 16.5,
      chocolate: 19.0,
      sugar: 3.2,
      cooking_oil: 3.0
    },
    shopping: {
      clothing: 10,
      electronics: 50,
      furniture: 100,
      groceries: 2,
      books: 1,
      shoes: 14,
      accessories: 5,
      appliances: 75,
      cosmetics: 3,
      toys: 8,
      sports_equipment: 30,
      jewelry: 6
    },
    waste: {
      landfill: 0.58,
      recycled: 0.02,
      composted: 0.01,
      incinerated: 0.35,
      e_waste: 1.5
    },
    home: {
      ac_per_hour: 1.5,
      heating_per_hour: 2.0,
      gas_cooking_per_hour: 0.9,
      washing_machine_per_load: 0.6,
      dryer_per_load: 2.4,
      dishwasher_per_load: 0.7,
      led_bulb_per_hour: 0.005,
      incandescent_per_hour: 0.03
    }
  },

  /* ── Averages & Benchmarks ── */
  averages: {
    global_annual_per_capita: 4700,
    us_annual: 16000,
    eu_annual: 6500,
    india_annual: 1900,
    china_annual: 7400,
    target_2030: 2500,
    target_2050: 1000,
    daily_average: 12.88,
    weekly_average: 90.2,
    monthly_average: 391.7
  },

  /* ── Achievements ── */
  achievements: [
    { id: 'first_log', name: 'First Step', icon: '🌱', description: 'Log your first carbon activity', condition: 'logs >= 1', xp: 50, unlocked: false },
    { id: 'week_streak', name: 'Week Warrior', icon: '🔥', description: 'Maintain a 7-day logging streak', condition: 'streak >= 7', xp: 200, unlocked: false },
    { id: 'month_streak', name: 'Monthly Master', icon: '💪', description: 'Maintain a 30-day logging streak', condition: 'streak >= 30', xp: 1000, unlocked: false },
    { id: 'carbon_cutter', name: 'Carbon Cutter', icon: '✂️', description: 'Reduce weekly emissions by 10%', condition: 'weekly_reduction >= 10', xp: 300, unlocked: false },
    { id: 'green_commuter', name: 'Green Commuter', icon: '🚲', description: 'Use green transport 5 times', condition: 'green_transport >= 5', xp: 250, unlocked: false },
    { id: 'plant_power', name: 'Plant Power', icon: '🥗', description: 'Log 10 plant-based meals', condition: 'plant_meals >= 10', xp: 300, unlocked: false },
    { id: 'energy_saver', name: 'Energy Saver', icon: '⚡', description: 'Reduce electricity usage by 15%', condition: 'energy_reduction >= 15', xp: 400, unlocked: false },
    { id: 'zero_waste', name: 'Zero Waste Hero', icon: '♻️', description: 'Recycle or compost all waste for a week', condition: 'zero_waste_days >= 7', xp: 500, unlocked: false },
    { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', description: 'Share 5 achievements with the community', condition: 'shares >= 5', xp: 150, unlocked: false },
    { id: 'challenge_champ', name: 'Challenge Champion', icon: '🏆', description: 'Complete 3 community challenges', condition: 'challenges_completed >= 3', xp: 600, unlocked: false },
    { id: 'tree_planter', name: 'Virtual Forester', icon: '🌳', description: 'Offset equivalent of 10 trees', condition: 'trees_equivalent >= 10', xp: 750, unlocked: false },
    { id: 'water_wise', name: 'Water Wise', icon: '💧', description: 'Reduce water usage by 20%', condition: 'water_reduction >= 20', xp: 350, unlocked: false },
    { id: 'eco_shopper', name: 'Eco Shopper', icon: '🛍️', description: 'Choose secondhand 5 times', condition: 'secondhand >= 5', xp: 200, unlocked: false },
    { id: 'flight_free', name: 'Flight Free', icon: '✈️', description: 'Go 3 months without flying', condition: 'flight_free_months >= 3', xp: 800, unlocked: false },
    { id: 'level_10', name: 'Rising Star', icon: '⭐', description: 'Reach Level 10', condition: 'level >= 10', xp: 500, unlocked: false },
    { id: 'level_25', name: 'Eco Expert', icon: '🌟', description: 'Reach Level 25', condition: 'level >= 25', xp: 1000, unlocked: false },
    { id: 'top_10', name: 'Leaderboard Legend', icon: '👑', description: 'Reach top 10 on the leaderboard', condition: 'rank <= 10', xp: 1500, unlocked: false },
    { id: 'first_challenge', name: 'Challenge Accepted', icon: '🎯', description: 'Join your first challenge', condition: 'challenges_joined >= 1', xp: 100, unlocked: false },
    { id: 'gpt_chat', name: 'AI Explorer', icon: '🤖', description: 'Have 10 conversations with CarbonGPT', condition: 'chats >= 10', xp: 200, unlocked: false },
    { id: 'carbon_negative', name: 'Carbon Negative', icon: '🌍', description: 'Achieve net negative carbon for a week', condition: 'negative_week', xp: 2000, unlocked: false },
    { id: 'data_nerd', name: 'Data Enthusiast', icon: '📊', description: 'View analytics 20 times', condition: 'analytics_views >= 20', xp: 150, unlocked: false },
    { id: 'mentor', name: 'Eco Mentor', icon: '🧑‍🏫', description: 'Help 5 community members', condition: 'helped >= 5', xp: 400, unlocked: false },
    { id: 'hundred_days', name: 'Century Streak', icon: '💯', description: 'Maintain a 100-day streak', condition: 'streak >= 100', xp: 5000, unlocked: false },
    { id: 'simulator_pro', name: 'What-If Wizard', icon: '🔮', description: 'Run 10 simulations', condition: 'simulations >= 10', xp: 200, unlocked: false }
  ],

  /* ── Challenges ── */
  challenges: [
    { id: 'ch1', title: 'Meatless Week', icon: '🥬', description: 'Go 7 days without eating meat. Discover delicious plant-based alternatives!', duration: '7 days', difficulty: 'Medium', reward: 500, category: 'food', target: 7, progress: 0, participants: 1243, status: 'active' },
    { id: 'ch2', title: 'Bike to Work', icon: '🚴', description: 'Commute by bicycle for 5 consecutive workdays. Great exercise and zero emissions!', duration: '5 days', difficulty: 'Hard', reward: 400, category: 'transport', target: 5, progress: 0, participants: 856, status: 'active' },
    { id: 'ch3', title: 'Cold Shower Challenge', icon: '🚿', description: 'Take cold showers for 7 days. Save energy and boost your immune system!', duration: '7 days', difficulty: 'Hard', reward: 350, category: 'energy', target: 7, progress: 0, participants: 567, status: 'active' },
    { id: 'ch4', title: 'Zero Plastic Week', icon: '🚯', description: 'Avoid single-use plastics for an entire week. Bring your own bags, bottles, and containers.', duration: '7 days', difficulty: 'Medium', reward: 450, category: 'waste', target: 7, progress: 0, participants: 2100, status: 'active' },
    { id: 'ch5', title: 'Digital Detox', icon: '📵', description: 'Reduce screen time by 50% for 3 days. Save electricity and reconnect with nature.', duration: '3 days', difficulty: 'Easy', reward: 200, category: 'energy', target: 3, progress: 0, participants: 1589, status: 'active' },
    { id: 'ch6', title: 'Local Food Only', icon: '🌽', description: 'Eat only locally sourced food for a week. Reduce food-miles and support local farmers!', duration: '7 days', difficulty: 'Medium', reward: 400, category: 'food', target: 7, progress: 0, participants: 934, status: 'active' },
    { id: 'ch7', title: 'Carpool Week', icon: '🚗', description: 'Share rides with others for all your trips this week. Half the cars, half the emissions!', duration: '5 days', difficulty: 'Easy', reward: 300, category: 'transport', target: 5, progress: 0, participants: 1456, status: 'active' },
    { id: 'ch8', title: 'Lights Out', icon: '💡', description: 'Reduce electricity usage by 30% this week. Use natural light and efficient appliances.', duration: '7 days', difficulty: 'Medium', reward: 400, category: 'energy', target: 7, progress: 0, participants: 1867, status: 'active' },
    { id: 'ch9', title: 'Thrift Store Fashion', icon: '👗', description: 'Buy only secondhand clothes this month. Sustainable fashion is the future!', duration: '30 days', difficulty: 'Easy', reward: 600, category: 'shopping', target: 30, progress: 0, participants: 723, status: 'active' },
    { id: 'ch10', title: 'Composting Starter', icon: '🪱', description: 'Start composting kitchen scraps. Turn waste into garden gold!', duration: '14 days', difficulty: 'Easy', reward: 350, category: 'waste', target: 14, progress: 0, participants: 1105, status: 'active' },
    { id: 'ch11', title: 'Shower Timer', icon: '⏱️', description: 'Keep showers under 5 minutes for 10 days. Save both water and energy!', duration: '10 days', difficulty: 'Medium', reward: 300, category: 'water', target: 10, progress: 0, participants: 2340, status: 'active' },
    { id: 'ch12', title: 'Public Transit Pro', icon: '🚌', description: 'Use only public transportation for 2 weeks. Discover your city from a new perspective!', duration: '14 days', difficulty: 'Hard', reward: 700, category: 'transport', target: 14, progress: 0, participants: 645, status: 'active' },
    { id: 'ch13', title: 'Home Energy Audit', icon: '🔍', description: 'Audit your home energy usage and implement 3 improvements.', duration: '7 days', difficulty: 'Medium', reward: 500, category: 'energy', target: 3, progress: 0, participants: 890, status: 'active' },
    { id: 'ch14', title: 'Grow Your Own', icon: '🌱', description: 'Start growing herbs or vegetables at home. Nothing beats fresh, zero-mile food!', duration: '30 days', difficulty: 'Easy', reward: 400, category: 'food', target: 30, progress: 0, participants: 1678, status: 'active' },
    { id: 'ch15', title: 'The 1-Ton Challenge', icon: '🎯', description: 'Reduce your monthly carbon footprint by 1 ton compared to your baseline.', duration: '30 days', difficulty: 'Expert', reward: 2000, category: 'all', target: 1000, progress: 0, participants: 342, status: 'active' },
    { id: 'ch16', title: 'Water Saver', icon: '💧', description: 'Cut your water usage by 25% for two weeks. Every drop counts!', duration: '14 days', difficulty: 'Medium', reward: 400, category: 'water', target: 14, progress: 0, participants: 1200, status: 'active' }
  ],

  /* ── Eco Tips ── */
  tips: [
    { id: 1, category: 'transport', text: 'Walk or bike for trips under 3 km. You\'ll save about 0.5 kg CO₂ per trip.', impact: 'high' },
    { id: 2, category: 'transport', text: 'Work from home when possible. One day saves ~3.5 kg CO₂ from commuting.', impact: 'high' },
    { id: 3, category: 'transport', text: 'Keep tires properly inflated to improve fuel efficiency by up to 3%.', impact: 'medium' },
    { id: 4, category: 'transport', text: 'Use cruise control on highways to reduce fuel consumption by 6%.', impact: 'medium' },
    { id: 5, category: 'transport', text: 'Consider carpooling. Sharing rides with just one person cuts emissions in half.', impact: 'high' },
    { id: 6, category: 'energy', text: 'Switch to LED bulbs. They use 75% less energy than incandescent lights.', impact: 'medium' },
    { id: 7, category: 'energy', text: 'Set your thermostat 2°C lower in winter and higher in summer to save up to 10% on heating/cooling.', impact: 'high' },
    { id: 8, category: 'energy', text: 'Unplug electronics when not in use. Phantom loads can account for 10% of your electricity bill.', impact: 'medium' },
    { id: 9, category: 'energy', text: 'Air-dry your clothes instead of using a dryer. Save 2.4 kg CO₂ per load!', impact: 'high' },
    { id: 10, category: 'energy', text: 'Use a smart power strip to eliminate standby power consumption.', impact: 'medium' },
    { id: 11, category: 'food', text: 'Eat one more plant-based meal per week. Replacing beef with beans saves ~6 kg CO₂.', impact: 'high' },
    { id: 12, category: 'food', text: 'Buy seasonal produce. Out-of-season food often travels thousands of miles.', impact: 'medium' },
    { id: 13, category: 'food', text: 'Reduce food waste. Plan meals, use leftovers, and compost scraps.', impact: 'high' },
    { id: 14, category: 'food', text: 'Choose chicken or fish over beef and lamb for 5-6x lower emissions.', impact: 'high' },
    { id: 15, category: 'food', text: 'Bring your own lunch to work instead of ordering delivery.', impact: 'medium' },
    { id: 16, category: 'food', text: 'Drink tap water instead of bottled. Manufacturing bottles produces significant CO₂.', impact: 'medium' },
    { id: 17, category: 'food', text: 'Start a small herb garden. Fresh herbs at zero food miles!', impact: 'low' },
    { id: 18, category: 'food', text: 'Use a pressure cooker. It uses 70% less energy than conventional cooking.', impact: 'medium' },
    { id: 19, category: 'water', text: 'Fix leaky faucets. A dripping tap wastes up to 20,000 liters per year.', impact: 'medium' },
    { id: 20, category: 'water', text: 'Take shorter showers. Every minute saved conserves ~9 liters of water.', impact: 'medium' },
    { id: 21, category: 'water', text: 'Install low-flow showerheads to reduce water usage by 40%.', impact: 'high' },
    { id: 22, category: 'water', text: 'Collect rainwater for watering plants. Free and sustainable!', impact: 'low' },
    { id: 23, category: 'water', text: 'Run dishwashers and washing machines only with full loads.', impact: 'medium' },
    { id: 24, category: 'waste', text: 'Carry a reusable water bottle. Save 150+ plastic bottles per year.', impact: 'medium' },
    { id: 25, category: 'waste', text: 'Bring reusable bags shopping. A plastic bag takes 500 years to decompose.', impact: 'medium' },
    { id: 26, category: 'waste', text: 'Start composting. It diverts 30% of household waste from landfills.', impact: 'high' },
    { id: 27, category: 'waste', text: 'Recycle electronics properly. E-waste contains valuable recoverable materials.', impact: 'medium' },
    { id: 28, category: 'waste', text: 'Buy products with minimal packaging. Less packaging = less waste.', impact: 'medium' },
    { id: 29, category: 'waste', text: 'Repair items instead of replacing them. Extend product lifespans.', impact: 'high' },
    { id: 30, category: 'shopping', text: 'Buy quality items that last longer. Fast fashion is a major polluter.', impact: 'high' },
    { id: 31, category: 'shopping', text: 'Shop secondhand. Give pre-owned items a new life.', impact: 'high' },
    { id: 32, category: 'shopping', text: 'Borrow or rent items you rarely use instead of buying new.', impact: 'medium' },
    { id: 33, category: 'shopping', text: 'Choose products with eco-certifications (FSC, Fair Trade, organic).', impact: 'medium' },
    { id: 34, category: 'shopping', text: 'Support local businesses. Shorter supply chains = fewer emissions.', impact: 'medium' },
    { id: 35, category: 'home', text: 'Insulate your home properly. Heating/cooling is ~40% of home energy use.', impact: 'high' },
    { id: 36, category: 'home', text: 'Use natural light whenever possible. Open curtains before switching on lights.', impact: 'low' },
    { id: 37, category: 'home', text: 'Plant trees around your home. They provide natural shade and cooling.', impact: 'medium' },
    { id: 38, category: 'home', text: 'Install a programmable thermostat. Save energy when you\'re away or asleep.', impact: 'high' },
    { id: 39, category: 'home', text: 'Use ceiling fans instead of AC when possible. They use 90% less energy.', impact: 'high' },
    { id: 40, category: 'travel', text: 'Choose direct flights. Take-offs and landings produce the most emissions.', impact: 'medium' },
    { id: 41, category: 'travel', text: 'Take the train instead of flying for trips under 500 km.', impact: 'high' },
    { id: 42, category: 'travel', text: 'Offset your flights through verified carbon offset programs.', impact: 'medium' },
    { id: 43, category: 'travel', text: 'Choose eco-friendly hotels that have sustainability certifications.', impact: 'medium' },
    { id: 44, category: 'work', text: 'Go paperless. Use digital documents, notes, and communication.', impact: 'medium' },
    { id: 45, category: 'work', text: 'Use video conferencing instead of business travel when possible.', impact: 'high' },
    { id: 46, category: 'work', text: 'Encourage your workplace to switch to renewable energy.', impact: 'high' },
    { id: 47, category: 'general', text: 'Track your carbon footprint regularly. Awareness is the first step to change.', impact: 'medium' },
    { id: 48, category: 'general', text: 'Talk about climate action with friends and family. Influence multiplies impact.', impact: 'high' },
    { id: 49, category: 'general', text: 'Vote for leaders who prioritize environmental protection.', impact: 'high' },
    { id: 50, category: 'general', text: 'Support renewable energy initiatives. Consider switching to a green energy provider.', impact: 'high' },
    { id: 51, category: 'general', text: 'Educate yourself about climate change. Knowledge empowers action.', impact: 'medium' },
    { id: 52, category: 'general', text: 'Join a local environmental group. Community action drives systemic change.', impact: 'medium' }
  ],

  /* ── Community Posts ── */
  communityPosts: [
    { id: 1, author: 'Anika Sharma', avatar: 'AS', time: '2 hours ago', content: 'Just completed the Meatless Week challenge! 🥬 I discovered so many amazing plant-based recipes. My favorite was the lentil curry — delicious and only 0.9 kg CO₂ per serving vs 27 kg for beef!', likes: 47, comments: 12, liked: false, badge: 'Eco Expert' },
    { id: 2, author: 'Marcus Chen', avatar: 'MC', time: '5 hours ago', content: 'Cycled to work for the entire month! 🚴‍♂️ Saved 126 kg CO₂ compared to driving. Plus, I\'ve lost 3 kg and feel amazing. Nature\'s gym is the best gym!', likes: 89, comments: 23, liked: false, badge: 'Green Commuter' },
    { id: 3, author: 'Priya Patel', avatar: 'PP', time: '8 hours ago', content: 'Installed solar panels last weekend! ☀️ My first week data shows I\'m generating 25 kWh/day. That\'s about 10 kg CO₂ saved daily. The investment pays for itself in 7 years.', likes: 134, comments: 31, liked: false, badge: 'Energy Saver' },
    { id: 4, author: 'James Wilson', avatar: 'JW', time: '1 day ago', content: 'Started composting 3 months ago and I\'ve diverted 45 kg of organic waste from landfill! 🪱 My garden is thriving with the nutrient-rich compost. Win-win!', likes: 62, comments: 18, liked: false, badge: 'Zero Waste Hero' },
    { id: 5, author: 'Sofia Rodriguez', avatar: 'SR', time: '1 day ago', content: 'Switched to a bamboo toothbrush, reusable shopping bags, and a steel water bottle this month. Small changes, but my plastic waste dropped by 70%! 🌊', likes: 56, comments: 8, liked: false, badge: 'Eco Shopper' },
    { id: 6, author: 'David Kim', avatar: 'DK', time: '2 days ago', content: 'Used CarbonGPT to analyze my daily routine and found that my hot showers were my #2 emission source after driving! Switched to shorter, cooler showers. Saving 180 kg CO₂/year! 🚿', likes: 41, comments: 15, liked: false, badge: 'AI Explorer' },
    { id: 7, author: 'Emma Thompson', avatar: 'ET', time: '2 days ago', content: 'Our community garden just harvested its first batch of veggies! 🌽 Zero food miles, zero packaging, 100% organic. Fresh tomatoes taste incredible! Who else grows their own food?', likes: 73, comments: 22, liked: false, badge: 'Plant Power' },
    { id: 8, author: 'Raj Patel', avatar: 'RP', time: '3 days ago', content: 'Reached Level 25 on EcoGenie! 🌟 The gamification really motivates me to keep tracking. My annual emissions are down 35% from when I started 6 months ago.', likes: 98, comments: 27, liked: false, badge: 'Eco Expert' },
    { id: 9, author: 'Lisa Zhang', avatar: 'LZ', time: '4 days ago', content: 'Organized a neighborhood swap meet! 15 families exchanged clothes, books, and toys. We estimate we prevented 200 kg of CO₂ from new manufacturing. Community power! 🤝', likes: 112, comments: 34, liked: false, badge: 'Eco Mentor' },
    { id: 10, author: 'Tom Baker', avatar: 'TB', time: '5 days ago', content: 'Took the train instead of flying for my 400 km business trip. Saved 80 kg CO₂ and got to enjoy the scenery! Plus, I was productive on the train with wifi. 🚄', likes: 67, comments: 11, liked: false, badge: 'Flight Free' },
    { id: 11, author: 'Mia Johnson', avatar: 'MJ', time: '6 days ago', content: 'My EcoScore went from C to A in just 3 months! The simulator tool helped me identify the biggest impact changes. Focus on transport and food first — that\'s where 70% of savings come from! 📊', likes: 85, comments: 19, liked: false, badge: 'Carbon Cutter' },
    { id: 12, author: 'Alex Green', avatar: 'AG', time: '1 week ago', content: 'Just hit a 50-day streak! 🔥 The daily task system makes it so easy to build eco-friendly habits. Today\'s task: bring reusable containers to lunch. Done! ✅', likes: 54, comments: 13, liked: false, badge: 'Week Warrior' }
  ],

  /* ── Leaderboard ── */
  leaderboard: [
    { rank: 1, name: 'Anika Sharma', avatar: 'AS', points: 15240, level: 32, title: 'Earth Guardian', streak: 87 },
    { rank: 2, name: 'Marcus Chen', avatar: 'MC', points: 14100, level: 30, title: 'Earth Guardian', streak: 65 },
    { rank: 3, name: 'Priya Patel', avatar: 'PP', points: 13580, level: 29, title: 'Climate Champion', streak: 92 },
    { rank: 4, name: 'Raj Patel', avatar: 'RP', points: 12900, level: 27, title: 'Climate Champion', streak: 54 },
    { rank: 5, name: 'Lisa Zhang', avatar: 'LZ', points: 11750, level: 25, title: 'Eco Expert', streak: 78 },
    { rank: 6, name: 'Emma Thompson', avatar: 'ET', points: 10980, level: 24, title: 'Eco Expert', streak: 43 },
    { rank: 7, name: 'Mia Johnson', avatar: 'MJ', points: 10240, level: 22, title: 'Green Champion', streak: 61 },
    { rank: 8, name: 'Tom Baker', avatar: 'TB', points: 9560, level: 21, title: 'Green Champion', streak: 38 },
    { rank: 9, name: 'Sofia Rodriguez', avatar: 'SR', points: 8900, level: 19, title: 'Eco Warrior', streak: 45 },
    { rank: 10, name: 'David Kim', avatar: 'DK', points: 8340, level: 18, title: 'Eco Warrior', streak: 29 },
    { rank: 11, name: 'James Wilson', avatar: 'JW', points: 7680, level: 17, title: 'Green Advocate', streak: 33 },
    { rank: 12, name: 'Alex Green', avatar: 'AG', points: 7100, level: 16, title: 'Green Advocate', streak: 50 },
    { rank: 13, name: 'Nina Kowalski', avatar: 'NK', points: 6450, level: 15, title: 'Eco Enthusiast', streak: 22 },
    { rank: 14, name: 'Carlos Lopez', avatar: 'CL', points: 5890, level: 14, title: 'Eco Enthusiast', streak: 18 },
    { rank: 15, name: 'Sara Ahmed', avatar: 'SA', points: 5320, level: 13, title: 'Green Sprout', streak: 27 },
    { rank: 16, name: 'Ryan O\'Brien', avatar: 'RO', points: 4780, level: 12, title: 'Green Sprout', streak: 14 },
    { rank: 17, name: 'Yuki Tanaka', avatar: 'YT', points: 4210, level: 11, title: 'Eco Learner', streak: 19 },
    { rank: 18, name: 'Hannah Davis', avatar: 'HD', points: 3650, level: 10, title: 'Eco Learner', streak: 11 },
    { rank: 19, name: 'Omar Hassan', avatar: 'OH', points: 3100, level: 9, title: 'Eco Seed', streak: 8 },
    { rank: 20, name: 'Chloe Martin', avatar: 'CM', points: 2540, level: 8, title: 'Eco Seed', streak: 5 }
  ],

  /* ── Rewards ── */
  rewards: [
    { id: 'r1', name: 'Custom Badge Frame', icon: '🖼️', description: 'Unlock a premium frame for your profile badge', cost: 500, category: 'cosmetic', available: true },
    { id: 'r2', name: 'Eco Warrior Title', icon: '🛡️', description: 'Exclusive "Eco Warrior" title for your profile', cost: 1000, category: 'cosmetic', available: true },
    { id: 'r3', name: 'Plant a Real Tree', icon: '🌳', description: 'We plant a real tree on your behalf through our partner NGO', cost: 2000, category: 'impact', available: true },
    { id: 'r4', name: 'Carbon Offset Credit', icon: '🌍', description: '1 ton verified carbon offset credit', cost: 5000, category: 'impact', available: true },
    { id: 'r5', name: 'Premium Themes', icon: '🎨', description: 'Unlock exclusive dark and light theme variants', cost: 800, category: 'cosmetic', available: true },
    { id: 'r6', name: 'Reusable Starter Kit', icon: '🎁', description: 'Eco-friendly reusable bag, bottle, and straw set', cost: 3000, category: 'physical', available: true },
    { id: 'r7', name: 'Bamboo Notebook', icon: '📓', description: 'Beautiful sustainably-sourced bamboo cover notebook', cost: 1500, category: 'physical', available: true },
    { id: 'r8', name: 'Seed Bomb Pack', icon: '🌸', description: 'Pack of 20 wildflower seed bombs for guerrilla gardening', cost: 1200, category: 'physical', available: true },
    { id: 'r9', name: 'Solar Phone Charger', icon: '🔋', description: 'Portable solar panel phone charger', cost: 4000, category: 'physical', available: true },
    { id: 'r10', name: 'EcoGenie Pro', icon: '⭐', description: '3 months of EcoGenie Pro with advanced analytics', cost: 3500, category: 'digital', available: true },
    { id: 'r11', name: 'Community Leader Badge', icon: '👑', description: 'Show your dedication with the Community Leader badge', cost: 2500, category: 'cosmetic', available: true },
    { id: 'r12', name: 'Eco Cookbook PDF', icon: '📖', description: '100 low-carbon recipes from around the world', cost: 600, category: 'digital', available: true },
    { id: 'r13', name: 'Carbon Report PDF', icon: '📄', description: 'Detailed personal carbon footprint analysis report', cost: 400, category: 'digital', available: true },
    { id: 'r14', name: 'Donate to WWF', icon: '🐼', description: 'Donate equivalent to World Wildlife Fund', cost: 2000, category: 'impact', available: true },
    { id: 'r15', name: 'Ocean Cleanup Donation', icon: '🌊', description: 'Contribute to ocean plastic cleanup efforts', cost: 2500, category: 'impact', available: true },
    { id: 'r16', name: 'Custom Eco Stickers', icon: '🏷️', description: 'Set of 20 eco-themed vinyl stickers', cost: 700, category: 'physical', available: true }
  ],

  /* ── Marketplace Products ── */
  marketplaceProducts: [
    { id: 'mp1', name: 'Bamboo Water Bottle', icon: '🍶', price: '$24.99', rating: 4.8, reviews: 342, carbonSaved: '5 kg CO₂/year', category: 'reusable' },
    { id: 'mp2', name: 'Solar Power Bank', icon: '☀️', price: '$39.99', rating: 4.6, reviews: 128, carbonSaved: '15 kg CO₂/year', category: 'energy' },
    { id: 'mp3', name: 'Beeswax Food Wraps', icon: '🐝', price: '$14.99', rating: 4.7, reviews: 567, carbonSaved: '3 kg CO₂/year', category: 'reusable' },
    { id: 'mp4', name: 'LED Smart Bulb Pack', icon: '💡', price: '$29.99', rating: 4.9, reviews: 891, carbonSaved: '200 kg CO₂/year', category: 'energy' },
    { id: 'mp5', name: 'Compost Bin Starter', icon: '🪣', price: '$34.99', rating: 4.5, reviews: 234, carbonSaved: '80 kg CO₂/year', category: 'waste' },
    { id: 'mp6', name: 'Organic Cotton Tote', icon: '👜', price: '$12.99', rating: 4.4, reviews: 456, carbonSaved: '8 kg CO₂/year', category: 'reusable' },
    { id: 'mp7', name: 'Smart Thermostat', icon: '🌡️', price: '$149.99', rating: 4.8, reviews: 678, carbonSaved: '500 kg CO₂/year', category: 'energy' },
    { id: 'mp8', name: 'Reusable Straw Set', icon: '🥤', price: '$9.99', rating: 4.6, reviews: 1234, carbonSaved: '1 kg CO₂/year', category: 'reusable' },
    { id: 'mp9', name: 'Low-Flow Showerhead', icon: '🚿', price: '$19.99', rating: 4.7, reviews: 345, carbonSaved: '150 kg CO₂/year', category: 'water' },
    { id: 'mp10', name: 'Bicycle Repair Kit', icon: '🔧', price: '$22.99', rating: 4.5, reviews: 189, carbonSaved: '350 kg CO₂/year', category: 'transport' },
    { id: 'mp11', name: 'Herb Garden Kit', icon: '🌿', price: '$27.99', rating: 4.8, reviews: 567, carbonSaved: '10 kg CO₂/year', category: 'food' },
    { id: 'mp12', name: 'Smart Power Strip', icon: '🔌', price: '$34.99', rating: 4.6, reviews: 234, carbonSaved: '100 kg CO₂/year', category: 'energy' }
  ],

  /* ── CarbonGPT Responses ── */
  carbonGPTResponses: {
    greetings: [
      "Hello! 🌿 I'm CarbonGPT, your AI sustainability coach. I can help you understand your carbon footprint, suggest reductions, and answer any eco-related questions. What would you like to know?",
      "Hi there! 🌍 Ready to make a positive impact on the planet? Ask me anything about carbon footprints, sustainability, or eco-friendly living!",
      "Welcome! 🍃 I'm here to help you on your sustainability journey. Whether it's about transport, food, energy, or waste — I've got tips and insights for you!"
    ],
    transport: [
      "🚗 **Transport Tips:**\n\nTransport accounts for about 27% of global CO₂ emissions. Here's how to reduce yours:\n\n• **Walk or bike** for trips under 3 km (saves ~0.2 kg CO₂/km)\n• **Use public transit** — buses emit 75% less CO₂ per passenger than cars\n• **Carpool** when possible — sharing cuts emissions in half\n• **Consider an EV** — electric cars produce 50-70% less lifetime emissions\n• **Maintain your vehicle** — proper tire pressure alone improves efficiency by 3%\n\nA single person switching from car to bike for their daily 10 km commute saves **766 kg CO₂ annually**!",
      "🚌 Great question about transport! The average car emits about 4.6 metric tons of CO₂ per year. Here are your greenest options (per km):\n\n1. 🚶 Walking: 0 kg CO₂\n2. 🚲 Cycling: 0 kg CO₂\n3. 🚇 Metro: 0.033 kg CO₂\n4. 🚆 Train: 0.041 kg CO₂\n5. 🚌 Bus: 0.089 kg CO₂\n6. 🏍️ Motorcycle: 0.113 kg CO₂\n7. 🚗 Car (diesel): 0.17 kg CO₂\n8. 🚗 Car (petrol): 0.21 kg CO₂\n\nEvery green commute counts! 🌱"
    ],
    food: [
      "🍽️ **Food & Carbon:**\n\nFood production accounts for 26% of global emissions. Here's the impact per kg of food:\n\n• 🐑 Lamb: 39.2 kg CO₂ (highest!)\n• 🥩 Beef: 27.0 kg CO₂\n• 🧀 Cheese: 13.5 kg CO₂\n• 🐷 Pork: 12.1 kg CO₂\n• 🐔 Chicken: 6.9 kg CO₂\n• 🥬 Vegetables: 2.0 kg CO₂\n• 🫘 Legumes: 0.9 kg CO₂\n\n**Top tip:** Replacing beef with legumes in just 2 meals per week saves **~135 kg CO₂ per year!**",
      "🥗 Food choices have a massive impact! Here's what works:\n\n1. **Eat more plants** — Plant-based meals produce 50-90% less CO₂\n2. **Reduce food waste** — 8-10% of global emissions come from wasted food\n3. **Buy local & seasonal** — Reduces transport emissions significantly\n4. **Cook efficiently** — Use lids on pots, batch cook, and use pressure cookers\n5. **Cut dairy** — Cheese has a surprisingly high footprint at 13.5 kg CO₂/kg\n\nYou don't have to go fully vegan — even small shifts make a big difference! 🌱"
    ],
    energy: [
      "⚡ **Home Energy Tips:**\n\nResidential energy use produces about 20% of global emissions. Here's how to cut yours:\n\n• **Switch to LEDs** — Save 75% energy vs. incandescent bulbs\n• **Smart thermostat** — Saves 10-15% on heating/cooling costs\n• **Unplug vampires** — Standby electronics use 5-10% of home energy\n• **Air-dry clothes** — Saves 2.4 kg CO₂ per dryer load\n• **Use ceiling fans** — 90% less energy than air conditioning\n• **Insulate** — Proper insulation can reduce heating by 30-50%\n\n**Solar panels** can offset 80-100% of home electricity and pay for themselves in 6-8 years! ☀️",
      "💡 Energy efficiency is one of the easiest ways to reduce your footprint!\n\nQuick wins:\n• Turn off lights when leaving a room (save 0.03 kg CO₂/hour)\n• Wash clothes in cold water (saves 1.6 kg CO₂ per load)\n• Set AC to 25°C instead of 22°C (saves 15% energy)\n• Use a laptop instead of desktop (uses 80% less energy)\n• Switch to renewable energy provider if available\n\nThe average household can reduce emissions by **2-3 tons per year** with these simple changes!"
    ],
    water: [
      "💧 **Water Conservation:**\n\nWhile water's direct carbon footprint is small (0.0003 kg CO₂/liter), heating water is energy-intensive!\n\n• **Hot water** produces about 0.0032 kg CO₂/liter — 10x more than cold\n• Shorter showers (5 min vs 10) save ~45 liters and significant energy\n• **Low-flow fixtures** reduce water use by 40-50%\n• **Fix leaks** — A dripping faucet wastes 20,000 liters/year\n• **Rainwater harvesting** is free and reduces treatment energy\n\nHeating water accounts for about 18% of home energy use. Going cooler saves both water AND carbon! 🚿"
    ],
    waste: [
      "♻️ **Waste Reduction:**\n\nLandfill waste produces methane — a greenhouse gas 25x more potent than CO₂!\n\n• **Recycle** — Saves 0.56 kg CO₂ per kg vs. landfill\n• **Compost** — Diverts 30% of household waste and creates free fertilizer\n• **Reduce** first — The best waste is waste never created\n• **Reuse** — Extend product lifespans through repair and repurposing\n• **Refuse** — Say no to unnecessary packaging and single-use items\n\nThe average person produces 0.74 kg of waste per day. Proper management can cut waste-related emissions by **80%**! 🌍"
    ],
    shopping: [
      "🛍️ **Sustainable Shopping:**\n\nConsumer goods have significant embodied carbon:\n\n• 👕 Clothing: ~10 kg CO₂ per item\n• 📱 Electronics: ~50 kg CO₂ per device\n• 🪑 Furniture: ~100 kg CO₂ per piece\n\n**Smart strategies:**\n1. Buy secondhand — Saves 82% of the carbon\n2. Choose quality over quantity — Items that last 2x longer = 50% less impact\n3. Repair instead of replace\n4. Borrow or rent rarely-used items\n5. Look for eco-certifications\n\nFast fashion is the 3rd most polluting industry globally. Choosing thoughtfully makes a huge difference! 🌿"
    ],
    travel: [
      "✈️ **Green Travel:**\n\nFlying is the most carbon-intensive way to travel:\n\n• Domestic flight: 0.255 kg CO₂/km\n• International flight: 0.195 kg CO₂/km\n• A round trip NYC to London = ~1,600 kg CO₂ per person!\n\n**Alternatives:**\n• Take trains for distances under 500 km\n• Choose direct flights (take-offs use the most fuel)\n• Fly economy (3x less emissions than business class)\n• Offset unavoidable flights through verified programs\n• Vacation locally — discover hidden gems near home\n\nOne transatlantic flight can equal 6 months of driving! 🌍"
    ],
    home: [
      "🏠 **Eco-Friendly Home:**\n\n• **Insulation** is king — saves 30-50% on heating/cooling\n• **Double-glazed windows** reduce heat loss by 50%\n• **Smart home devices** optimize energy use automatically\n• **Green your roof** — Living roofs insulate and absorb CO₂\n• **Native plants** in your garden reduce water needs by 50%\n• **Compost bin** for kitchen waste\n• **Energy audit** — Identify your biggest energy drains\n\nA well-optimized home can reduce carbon by **3-5 tons per year**! Start with the biggest wins: insulation, heating, and hot water. 🏡"
    ],
    general: [
      "🌍 **Your Carbon Impact:**\n\nThe global average carbon footprint is about 4.7 tons CO₂ per year. To meet Paris Agreement targets, we need to get to **2.5 tons by 2030**.\n\nThe biggest impact areas:\n1. 🚗 Transport: 27% of emissions\n2. 🏠 Home energy: 20% of emissions\n3. 🍽️ Food: 26% of emissions\n4. 🛍️ Shopping: 15% of emissions\n5. ♻️ Waste: 5% of emissions\n\nFocusing on your top 2-3 categories can reduce your footprint by **40-60%**. Every action counts! Let me help you identify your biggest opportunities. 💪"
    ],
    motivation: [
      "💚 Remember — you don't have to be perfect to make a difference!\n\n**Consider this:**\n• If everyone reduced meat by 50%, we'd save **5 billion tons CO₂/year**\n• If everyone cycled 5 km instead of driving, we'd save **1 billion tons CO₂/year**\n• If every household switched to LEDs, we'd save **1.4 billion tons CO₂/year**\n\nYour individual actions:\n✅ Inspire others through example\n✅ Create market demand for green products\n✅ Build habits that compound over time\n✅ Raise awareness in your community\n\nYou're already doing great by being here! Every kilogram of CO₂ saved matters. 🌱",
      "🌟 You're making amazing progress! Here are some perspective-boosting facts:\n\n• A single tree absorbs ~22 kg CO₂ per year\n• Your actions today ripple forward for generations\n• Studies show eco-habits spread to 3-5 people in your social circle\n• Small daily changes = massive annual impact\n\nKeep going — the planet needs heroes like you! 🦸‍♀️🌍"
    ],
    offset: [
      "🌳 **Carbon Offsetting:**\n\nOffsetting helps neutralize emissions you can't yet eliminate:\n\n• **Tree planting** — One tree absorbs ~22 kg CO₂/year\n• **Renewable energy projects** — Fund wind/solar in developing regions\n• **Methane capture** — Prevent landfill methane from entering atmosphere\n• **Clean cookstove programs** — Reduce deforestation and indoor pollution\n\n**Important:** Offsetting should complement, not replace, emission reduction. The priority order is:\n1. **Reduce** your footprint first\n2. **Switch** to green alternatives\n3. **Offset** what remains\n\nLook for Gold Standard or Verified Carbon Standard (VCS) certified offsets! ✅"
    ],
    fallback: [
      "That's a great question! 🤔 While I may not have specific data on that topic, here are some general tips:\n\n• Track your daily activities to identify your biggest emission sources\n• Focus on transport and food — they're typically the highest impact areas\n• Make one small change at a time for sustainable habits\n• Use the simulator to see the impact of different choices\n\nWant me to help with something more specific? Try asking about transport, food, energy, water, waste, or shopping! 🌿",
      "I'd love to help with that! 💚 Here are some resources:\n\n• Check the **Dashboard** for your current emissions breakdown\n• Use the **Simulator** to compare different lifestyle choices\n• Browse **Challenges** for guided sustainability activities\n• Visit **Analytics** for detailed trends and insights\n\nFeel free to ask me about any specific category — transport 🚗, food 🍽️, energy ⚡, water 💧, waste ♻️, or shopping 🛍️!"
    ]
  },

  /* ── Level Titles ── */
  levelTitles: {
    1: 'Eco Seed', 2: 'Eco Seed', 3: 'Eco Sprout', 4: 'Eco Sprout', 5: 'Green Leaf',
    6: 'Green Leaf', 7: 'Eco Learner', 8: 'Eco Learner', 9: 'Eco Learner', 10: 'Rising Star',
    11: 'Rising Star', 12: 'Green Sprout', 13: 'Green Sprout', 14: 'Eco Enthusiast', 15: 'Eco Enthusiast',
    16: 'Green Advocate', 17: 'Green Advocate', 18: 'Eco Warrior', 19: 'Eco Warrior', 20: 'Green Champion',
    21: 'Green Champion', 22: 'Green Champion', 23: 'Eco Expert', 24: 'Eco Expert', 25: 'Eco Expert',
    26: 'Earth Defender', 27: 'Earth Defender', 28: 'Earth Guardian', 29: 'Earth Guardian', 30: 'Earth Guardian',
    31: 'Earth Guardian', 32: 'Earth Guardian', 33: 'Climate Champion', 34: 'Climate Champion', 35: 'Climate Champion',
    36: 'Climate Champion', 37: 'Climate Hero', 38: 'Climate Hero', 39: 'Climate Hero', 40: 'Planet Protector',
    41: 'Planet Protector', 42: 'Planet Protector', 43: 'Planet Protector', 44: 'Sustainability Sage', 45: 'Sustainability Sage',
    46: 'Sustainability Sage', 47: 'Eco Legend', 48: 'Eco Legend', 49: 'Eco Legend', 50: 'Eco Transcendent'
  },

  /* ── XP Requirements per Level ── */
  xpPerLevel: function(level) {
    return Math.floor(100 * Math.pow(1.15, level - 1));
  },

  /* ── Eco Score Ratings ── */
  ecoScoreRatings: {
    A: { min: 80, label: 'Excellent', color: '#10b981', description: 'Outstanding! You\'re well below average emissions.' },
    B: { min: 60, label: 'Good', color: '#14b8a6', description: 'Great job! You\'re below average emissions.' },
    C: { min: 40, label: 'Average', color: '#f59e0b', description: 'You\'re around the global average. Room for improvement!' },
    D: { min: 20, label: 'Below Average', color: '#f97316', description: 'Your emissions are above average. Let\'s work on reducing them.' },
    F: { min: 0, label: 'Needs Work', color: '#ef4444', description: 'High emissions detected. Small changes can make a big difference!' }
  },

  /* ── Groups ── */
  groups: [
    { id: 'g1', name: 'Zero Waste Warriors', icon: '♻️', members: 3420, description: 'Dedicated to minimizing waste in daily life' },
    { id: 'g2', name: 'Plant-Based Pioneers', icon: '🌱', members: 5100, description: 'Exploring the world of plant-based eating' },
    { id: 'g3', name: 'Cycling Community', icon: '🚴', members: 2800, description: 'Two wheels, zero emissions, infinite adventures' },
    { id: 'g4', name: 'Solar Squad', icon: '☀️', members: 1950, description: 'Harnessing the power of the sun' },
    { id: 'g5', name: 'Urban Gardeners', icon: '🌻', members: 4200, description: 'Growing food in the city' },
    { id: 'g6', name: 'Eco Parents', icon: '👨‍👩‍👧', members: 3100, description: 'Raising the next generation of eco-warriors' }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EcoData;
}
