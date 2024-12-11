console.log("Hightouch Events app.js script loaded");

// Generate a 36-character, 128-bit GUID with hyphens
function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Retrieve or generate a unique Device ID
function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = generateGUID();
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
}

// Generate or retrieve FBC (Facebook Click ID)
function getFBC(fbclid) {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('_fbc='))
        ?.split('=')[1];

    if (cookieValue) return cookieValue;
    if (fbclid) return generateFBC(fbclid);
    return null;
}

// Generate FBP (Facebook Browser ID)
function getFBP() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('_fbp='))
        ?.split('=')[1];

    return cookieValue || generateFBP();
}

// Fetch IP and Geo Data
async function getIPData() {
    try {
        const [ipv4Response, ipv6Response] = await Promise.all([
            fetch('https://api.ipify.org?format=json'),
            fetch('https://api64.ipify.org?format=json')
        ]);

        const ipv4Data = await ipv4Response.json();
        const ipv6Data = await ipv6Response.json();

        const geoResponse = await fetch(`https://ipapi.co/${ipv4Data.ip}/json/`);
        const geoData = await geoResponse.json();

        return {
            ipAddress: ipv4Data.ip,
            ipv6Address: ipv6Data.ip,
            userCountry: geoData.country_name,
            userRegion: geoData.region,
            userCity: geoData.city,
            userPostal: geoData.postal,
        };
    } catch (error) {
        console.error("Error fetching IP and geo data:", error);
        return {};
    }
}

// Extract UTM Parameters
function getUTMParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        source: urlParams.get('utm_source'),
        medium: urlParams.get('utm_medium'),
        campaign: urlParams.get('utm_campaign'),
        id: urlParams.get('utm_id'),
        term: urlParams.get('utm_term'),
        content: urlParams.get('utm_content'),
        fbclid: urlParams.get('fbclid'),
        gclid: urlParams.get('gclid'),
        ... // other params
    };
}

// Gather Additional Params
async function getAdditionalParams() {
    const ipData = await getIPData();
    const utmParameters = getUTMParameters();
    return {
        ...ipData,
        utmParameters,
        fbc: getFBC(utmParameters.fbclid),
        fbp: getFBP(),
        device_id: getDeviceId(),
    };
}

// Track Page Views
async function trackPageView() {
    try {
        const additionalParams = await getAdditionalParams();
        window.htevents.page(
            "partial.ly",
            document.title,
            {
                ...additionalParams
            },
            function() {
                console.log("Page view tracked:", document.title);
            }
        );
    } catch (error) {
        console.error("Error tracking page view:", error);
    }
}

// Track initial page view
trackPageView();
