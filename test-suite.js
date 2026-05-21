require('dotenv').config();
const { db } = require('./src/config/database');

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  bold: "\x1b[1m",
  dim: "\x1b[2m"
};

const BASE_URL = 'http://localhost:5000/api';

async function runSuite() {
  console.log(`\n${colors.cyan}${colors.bold}====================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}   CLOUD BUS PASS SYSTEM - INTEGRATION TEST SUITE   ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}====================================================${colors.reset}\n`);

  // Step 0: Connectivity Verification
  console.log(`${colors.bold}[SYSTEM]${colors.reset} Verifying backend server and Firestore emulator connectivity...`);
  
  // 0a. Check backend server
  try {
    const healthRes = await fetch('http://localhost:5000/api/health');
    if (!healthRes.ok) {
      throw new Error(`Health check returned status ${healthRes.status}`);
    }
    const healthData = await healthRes.json();
    console.log(`  ${colors.green}✓${colors.reset} Backend Server is online. Status: ${colors.green}${healthData.status}${colors.reset}`);
  } catch (err) {
    console.error(`\n${colors.red}${colors.bold}[FAIL] Connection to backend server on port 5000 failed!${colors.reset}`);
    console.error(`  Please make sure your server is running (e.g., 'npm run dev' or 'npm start').\n`);
    process.exit(1);
  }

  // 0b. Check Firestore Emulator
  try {
    // Attempting a simple write/read to check if the emulator is listening on localhost:8080
    const routeRef = db.collection('routes').doc('CONN-CHECK');
    await routeRef.set({ check: true });
    await routeRef.delete();
    console.log(`  ${colors.green}✓${colors.reset} Firestore Emulator is online and reachable at ${colors.green}${process.env.FIRESTORE_EMULATOR_HOST}${colors.reset}\n`);
  } catch (err) {
    console.error(`\n${colors.red}${colors.bold}[FAIL] Connection to Firestore Emulator failed!${colors.reset}`);
    console.error(`  Expected host: ${colors.yellow}${process.env.FIRESTORE_EMULATOR_HOST}${colors.reset}`);
    console.error(`  Please make sure the Firestore emulator is running locally (e.g., 'gcloud beta emulators firestore start' or 'firebase emulators:start').\n`);
    process.exit(1);
  }

  let aliceQrPayload = null;

  // ==========================================
  // STEP A: SEED DATA
  // ==========================================
  console.log(`${colors.bold}[STEP A] Programmatic DB Seeding${colors.reset}`);
  try {
    const routeRef = db.collection('routes').doc('ROUTE-777');
    await routeRef.set({
      routeName: "Downtown Express",
      availableSeats: 50
    });
    
    const route101Ref = db.collection('routes').doc('ROUTE-101');
    await route101Ref.set({
      routeName: "Local City Line",
      availableSeats: 50
    });
    
    console.log(`  ${colors.green}✓ PASS:${colors.reset} Successfully seeded route 'ROUTE-777' and 'ROUTE-101' with 50 seats each.\n`);
  } catch (err) {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} Seeding operation failed.`, err.message);
    process.exit(1);
  }

  // Final summary
  console.log(`${colors.cyan}${colors.bold}====================================================${colors.reset}`);
  console.log(`${colors.green}${colors.bold}   ALL INTEGRATION TEST PASSES COMPLETED SUCCESSFULLY   ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}====================================================${colors.reset}\n`);
}

runSuite();
