import './styles/main.css';
import './components/nav-bar';
import './components/meme-app';
import './components/meme-uploader';
import './components/meme-gallery';
import { supabase } from './config/supabase';
import { initializeStorage } from './config/supabase';

console.log('Checking Supabase configuration...');

async function initializeApp() {
  try {
    console.log('Initializing storage...');
    await initializeStorage();
    
    const { data, error } = await supabase.storage.from('memes').list();
    if (error) {
      console.warn('Note: Bucket might need manual configuration in Supabase dashboard');
      console.warn('Error details:', error.message);
    } else {
      console.log('Storage initialized successfully');
    }
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

initializeApp(); 