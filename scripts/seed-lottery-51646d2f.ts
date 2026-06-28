import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CAMPAIGN_ID = '51646d2f-e62a-4fbf-aae0-9c28ab955174';
const TOTAL = 99;
const WINNER_COUNT = 9;

const firstNames = [
  'Aarav',
  'Aditya',
  'Akash',
  'Amit',
  'Aniket',
  'Arjun',
  'Dev',
  'Gaurav',
  'Harsh',
  'Ishaan',
  'Kabir',
  'Karan',
  'Kunal',
  'Manish',
  'Mayank',
  'Nikhil',
  'Pranav',
  'Rahul',
  'Rohan',
  'Rohit',
  'Sameer',
  'Sanjay',
  'Siddharth',
  'Tushar',
  'Varun',
  'Vikram',
  'Yash',
  'Ananya',
  'Aaradhya',
  'Aditi',
  'Avani',
  'Diya',
  'Isha',
  'Kavya',
  'Meera',
  'Neha',
  'Pooja',
  'Priya',
  'Riya',
  'Sanjana',
  'Shreya',
  'Sneha',
  'Tanvi',
  'Vani',
  'Srinivas',
  'Rajesh',
  'Ramesh',
  'Suresh',
  'Mahesh',
  'Dinesh',
  'Naresh',
  'Vikash',
  'Alok',
  'Vivek',
  'Abhishek',
  'Deepak',
  'Sunil',
  'Anil',
  'Vijay',
  'Abhinav',
  'Chaitanya',
  'Darshan',
  'Gopal',
  'Hari',
  'Jitendra',
  'Ketan',
  'Lalit',
  'Manoj',
  'Naveen',
  'Pankaj',
  'Bhuvan',
  'Chetan',
  'Dhruv',
  'Eshan',
  'Farhan',
  'Girish',
  'Hemant',
  'Indrajit',
  'Jagdish',
  'Kishore',
  'Lokesh',
  'Mohan',
  'Nitin',
  'Om',
  'Prabhat',
  'Ravi',
  'Sachin',
  'Tarun',
  'Uday',
  'Umesh',
  'Vinay',
  'Wasim',
  'Yogesh',
  'Zubair',
  'Akshay',
  'Bharat',
  'Chandan',
];

const lastNames = [
  'Sharma',
  'Verma',
  'Gupta',
  'Patel',
  'Reddy',
  'Iyer',
  'Joshi',
  'Sen',
  'Kumar',
  'Singh',
  'Das',
  'Choudhury',
  'Ranjan',
  'Prasad',
  'Mishra',
  'Pandey',
  'Dubey',
  'Trivedi',
  'Pathak',
  'Sinha',
  'Sahay',
  'Nair',
  'Pillai',
  'Menon',
  'Rao',
  'Hegde',
  'Bhat',
  'Shenoy',
  'Adiga',
  'Naidu',
  'Yadav',
  'Mehta',
  'Shah',
  'Gala',
  'Desai',
  'Kulkarni',
  'Deshmukh',
  'Chavan',
  'Patil',
  'Pawar',
  'Thakur',
  'Jha',
  'Tiwari',
  'Agarwal',
  'Saxena',
  'Bajaj',
  'Kapoor',
  'Malhotra',
  'Chopra',
  'Bhatia',
  'Ahuja',
  'Sethi',
  'Gill',
  'Sodhi',
  'Dhingra',
  'Bansal',
  'Garg',
  'Bindra',
  'Dhawan',
  'Kohli',
];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUniqueNames(count: number): string[] {
  const names = new Set<string>();
  while (names.size < count) {
    names.add(`${random(firstNames)} ${random(lastNames)}`);
  }
  return Array.from(names);
}

async function main() {
  // Verify campaign exists
  const { data: campaign, error: cErr } = await supabase
    .from('lotteries')
    .select('id, title')
    .eq('id', CAMPAIGN_ID)
    .single();

  if (cErr || !campaign) {
    console.error('Campaign not found:', cErr?.message);
    process.exit(1);
  }

  console.log(`Campaign: "${campaign.title}" (${CAMPAIGN_ID})`);

  // Check existing count
  const { count: existing } = await supabase
    .from('lottery_participants')
    .select('*', { count: 'exact', head: true })
    .eq('lottery_id', CAMPAIGN_ID);

  console.log(`Existing participants: ${existing ?? 0}`);

  const names = generateUniqueNames(TOTAL);

  // Select 9 random winners
  const winnerIndices = new Set<number>();
  while (winnerIndices.size < WINNER_COUNT) {
    winnerIndices.add(Math.floor(Math.random() * TOTAL));
  }

  const participants = names.map((name, i) => {
    const isWinner = winnerIndices.has(i);
    const ticketIndex = 5000 + i;
    return {
      lottery_id: CAMPAIGN_ID,
      name,
      ticket_number: `SVI${ticketIndex}`,
      phone: `+91 98765 ${String(43000 + i).padStart(5, '0')}`,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      is_winner: isWinner,
      prize_rank: isWinner ? Math.floor(Math.random() * 3) + 1 : null,
    };
  });

  console.log(`Inserting ${participants.length} participants (${WINNER_COUNT} winners)...`);

  const { error } = await supabase.from('lottery_participants').insert(participants);

  if (error) {
    console.error('Insert failed:', error.message);
    process.exit(1);
  }

  // List winners
  const winners = participants.filter((p) => p.is_winner);
  console.log('\n✅ Done — 99 participants added, 9 winners:');
  winners.forEach((w) => console.log(`  🏆 ${w.name} — ${w.ticket_number} (rank ${w.prize_rank})`));
}

main();
