require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const result = await resend.emails.list();
  console.log(JSON.stringify(result, null, 2));
}
main();
