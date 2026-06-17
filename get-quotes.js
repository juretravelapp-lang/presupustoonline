const URL = 'https://yqtoicuvbhwxktbkngrf.supabase.co/rest/v1/travel_quotes?select=id,nombre,apellido,email,created_at&order=created_at.desc&limit=10';
const KEY = 'sb_publishable_ED7m8Uly8eRg1eW_WFnZWg_UujXkaqi';

async function run() {
  try {
    console.log('Fetching quotes...');
    const response = await fetch(URL, {
      method: 'GET',
      headers: {
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`,
      }
    });

    console.log('Status:', response.status, response.statusText);
    const text = await response.text();
    console.log('Body:', text);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

run();
