async function run() {
    try {
        const url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571&format=json&limit=10";
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        console.log("Status:", res.status);
        const data = await res.text();
        console.log("Data snippet:", data.substring(0, 500));
    } catch (e: any) {
        console.error(e.message);
    }
}
run();
