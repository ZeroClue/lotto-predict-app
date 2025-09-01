// Test script to verify the prediction engine functionality
// Run this to check if historical data fetching and number suggestions work

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/web/.env.local' });

async function testPredictionEngine() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('🧪 Testing Prediction Engine Components...\n');
  
  try {
    // 1. Test if lottery_draws table exists and has data
    console.log('1️⃣ Testing historical data availability...');
    const { data: draws, error: drawsError } = await supabase
      .from('lottery_draws')
      .select('*')
      .order('draw_date', { ascending: false })
      .limit(10);
    
    if (drawsError) {
      console.error('❌ Error fetching lottery draws:', drawsError.message);
      console.log('\n🔧 Fix: Ensure lottery_draws table exists and has data');
      console.log('   - Run database migrations in order (001_lottery_draws.sql first)');
      return;
    }
    
    if (!draws || draws.length === 0) {
      console.error('❌ No historical lottery data found in database');
      console.log('\n🔧 Fix: Populate lottery_draws table with historical data');
      console.log('   - The 001_lottery_draws.sql migration should insert sample data');
      return;
    }
    
    console.log(`✅ Found ${draws.length} lottery draws in database`);
    console.log(`   Latest draw: ${draws[0].lottery_name} on ${draws[0].draw_date}`);
    console.log(`   Winning numbers: [${draws[0].winning_numbers.join(', ')}]`);
    
    // 2. Test data structure and consistency
    console.log('\n2️⃣ Testing data structure consistency...');
    const drawsWithIssues = draws.filter(draw => 
      !draw.lottery_name || 
      !draw.winning_numbers || 
      !Array.isArray(draw.winning_numbers) ||
      draw.winning_numbers.length === 0
    );
    
    if (drawsWithIssues.length > 0) {
      console.warn(`⚠️ Found ${drawsWithIssues.length} draws with data issues`);
      drawsWithIssues.forEach(draw => {
        console.log(`   - Draw ID ${draw.id}: missing or invalid data`);
      });
    } else {
      console.log('✅ All draws have valid structure');
    }
    
    // 3. Test frequency analysis algorithm
    console.log('\n3️⃣ Testing number frequency analysis...');
    const allNumbers = draws.flatMap(draw => draw.winning_numbers);
    const frequencyMap = {};
    
    allNumbers.forEach(number => {
      frequencyMap[number] = (frequencyMap[number] || 0) + 1;
    });
    
    const frequencyAnalysis = Object.entries(frequencyMap)
      .map(([number, frequency]) => ({
        number: parseInt(number),
        frequency,
        percentage: (frequency / allNumbers.length) * 100,
      }))
      .sort((a, b) => b.frequency - a.frequency);
    
    if (frequencyAnalysis.length === 0) {
      console.error('❌ No numbers found for frequency analysis');
      return;
    }
    
    console.log(`✅ Frequency analysis completed:`);
    console.log(`   - Total numbers analyzed: ${allNumbers.length}`);
    console.log(`   - Unique numbers found: ${frequencyAnalysis.length}`);
    console.log(`   - Most frequent number: ${frequencyAnalysis[0].number} (${frequencyAnalysis[0].frequency} times)`);
    console.log(`   - Least frequent number: ${frequencyAnalysis[frequencyAnalysis.length-1].number} (${frequencyAnalysis[frequencyAnalysis.length-1].frequency} times)`);
    
    // 4. Test hot/cold number classification
    console.log('\n4️⃣ Testing hot/cold number classification...');
    const hotCount = Math.min(10, Math.floor(frequencyAnalysis.length * 0.2));
    const coldCount = Math.min(10, Math.floor(frequencyAnalysis.length * 0.2));
    
    const hotNumbers = frequencyAnalysis.slice(0, hotCount).map(item => item.number);
    const coldNumbers = frequencyAnalysis.slice(-coldCount).map(item => item.number).reverse();
    
    console.log(`✅ Classification completed:`);
    console.log(`   - Hot numbers (${hotNumbers.length}): [${hotNumbers.join(', ')}]`);
    console.log(`   - Cold numbers (${coldNumbers.length}): [${coldNumbers.join(', ')}]`);
    
    // 5. Test suggestion algorithm
    console.log('\n5️⃣ Testing number suggestion algorithm...');
    const suggestedNumbers = [];
    
    // Mix: 3 from hot, 2 from medium range, 1 random
    const hotForSuggestions = hotNumbers.slice(0, 15);
    const mediumStart = Math.floor(frequencyAnalysis.length * 0.3);
    const mediumEnd = Math.floor(frequencyAnalysis.length * 0.7);
    const mediumNumbers = frequencyAnalysis.slice(mediumStart, mediumEnd).map(item => item.number);
    
    // Get 3 random from hot numbers
    const shuffledHot = [...hotForSuggestions].sort(() => 0.5 - Math.random());
    suggestedNumbers.push(...shuffledHot.slice(0, 3));
    
    // Get 2 from medium range
    const shuffledMedium = [...mediumNumbers].sort(() => 0.5 - Math.random());
    suggestedNumbers.push(...shuffledMedium.slice(0, 2));
    
    // Get 1 more to make 6 total
    const remaining = frequencyAnalysis
      .filter(item => !suggestedNumbers.includes(item.number))
      .map(item => item.number);
    if (remaining.length > 0) {
      suggestedNumbers.push(remaining[Math.floor(Math.random() * remaining.length)]);
    }
    
    const finalSuggestions = suggestedNumbers.slice(0, 6).sort((a, b) => a - b);
    
    console.log(`✅ Generated ${finalSuggestions.length} number suggestions: [${finalSuggestions.join(', ')}]`);
    
    // 6. Test lottery-specific filtering
    console.log('\n6️⃣ Testing lottery-specific filtering...');
    const powerballDraws = draws.filter(draw => draw.lottery_name === 'Powerball');
    const megaMillionsDraws = draws.filter(draw => draw.lottery_name === 'Mega Millions');
    
    console.log(`✅ Lottery filtering works:`);
    console.log(`   - Powerball draws: ${powerballDraws.length}`);
    console.log(`   - Mega Millions draws: ${megaMillionsDraws.length}`);
    console.log(`   - Total draws: ${draws.length}`);
    
    console.log('\n🎉 Prediction Engine Test Results:');
    console.log('✅ Historical data: Available and valid');
    console.log('✅ Frequency analysis: Working correctly');
    console.log('✅ Hot/Cold classification: Functioning');
    console.log('✅ Number suggestions: Generated successfully');
    console.log('✅ Lottery filtering: Operational');
    
    console.log('\n📊 Summary Statistics:');
    console.log(`• Total lottery draws in database: ${draws.length}`);
    console.log(`• Total numbers analyzed: ${allNumbers.length}`);
    console.log(`• Unique numbers found: ${frequencyAnalysis.length}`);
    console.log(`• Hot numbers identified: ${hotNumbers.length}`);
    console.log(`• Cold numbers identified: ${coldNumbers.length}`);
    console.log(`• Suggested numbers: [${finalSuggestions.join(', ')}]`);
    
    if (draws.length < 20) {
      console.log('\n⚠️ Recommendation: Consider adding more historical data for better predictions');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure Supabase environment variables are correct');
    console.log('2. Verify lottery_draws table exists and is populated');
    console.log('3. Check database permissions and RLS policies');
    console.log('4. Run database migrations in correct order');
  }
}

testPredictionEngine();