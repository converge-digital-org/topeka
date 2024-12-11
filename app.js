// CLIENT: TOPEKA
// HIGHTOUCH EVENTS APP.JS FILE
// VERSION 4.0
// LAST UPDATED: 12/11/2024 AT 2:12 PM PT

console.log("Hightouch Events app.js script loaded");

// Function to generate a 36-character, 128-bit GUID with hyphens
function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function to get or generate a unique Device ID (GUID)
function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = generateGUID();
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
}

// Function to generate FBC (Facebook Click ID) parameter
function getFBC(fbclid) {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('_fbc='))
        ?.split('=')[1];

    return cookieValue || generateFBC(fbclid);
}

// Function to generate FBC if not found
function generateFBC(fbclid) {
    if (!fbclid) return null;
    const domain = window.location.hostname;
    const timestamp = Math.floor(Date.now() / 1000);
    const fbc = `fb.${domain}.${timestamp}.${fbclid}`;

    document.cookie = `_fbc=${fbc}; path=/; expires=${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString()}; SameSite=Lax`;

    return fbc;
}

// Function to get or generate FBP (Facebook Browser ID) parameter
function getFBP() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('_fbp='))
        ?.split('=')[1];

    return cookieValue || generateFBP();
}

// Function to generate FBP if not found
function generateFBP() {
    const version = 'fb.1.';
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const randomNumber = Math.random().toString(36).substring(2, 15);
    const fbp = version + timestamp + '.' + randomNumber;

    document.cookie = `_fbp=${fbp}; path=/; expires=${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString()}; SameSite=Lax`;

    return fbp;
}

// Function to get additional parameters (includes only "user_id")
async function getAdditionalParams() {
    let ipData = {};
    try {
        // Fetch IPv4 Address
        const ipv4Response = await fetch('https://api.ipify.org?format=json');
        const ipv4Data = await ipv4Response.json();
        ipData.ipAddress = ipv4Data.ip;

        // Fetch IPv6 Address
        const ipv6Response = await fetch('https://api64.ipify.org?format=json');
        const ipv6Data = await ipv6Response.json();
        ipData.ipv6Address = ipv6Data.ip;

        // Fetch Geo data using IPv4
        const geoResponse = await fetch(`https://ipapi.co/${ipv4Data.ip}/json/`);
        const geoData = await geoResponse.json();
        ipData = {
            ...ipData,
            userCountry: geoData.country_name,
            userRegion: geoData.region,
            userCity: geoData.city,
            userPostal: geoData.postal
        };
    } catch (error) {
        console.error("Hightouch: Error fetching IP and geo data:", error);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');

    return {
        ...ipData,
        utmParameters: {
            source: urlParams.get('utm_source'),
            medium: urlParams.get('utm_medium'),
            campaign: urlParams.get('utm_campaign'),
            id: urlParams.get('utm_id'),
            term: urlParams.get('utm_term'),
            content: urlParams.get('utm_content'),
            fbclid: fbclid,
            gclid: urlParams.get('gclid'),
            atrefid: urlParams.get('atrefid'),
            ad_id: urlParams.get('ad_id'),
            adset_id: urlParams.get('adset_id'),
            campaign_id: urlParams.get('campaign_id'),
            ad_name: urlParams.get('ad_name'),
            adset_name: urlParams.get('adset_name'),
            campaign_name: urlParams.get('campaign_name'),
            placement: urlParams.get('placement'),
            site_source_name: urlParams.get('site_source_name'),
            gbraid: urlParams.get('gbraid'),
            wbraid: urlParams.get('wbraid')
        },
        fbc: getFBC(fbclid),
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
            "page_viewed",
            {
                ...additionalParams
            },
            function() {
                console.log("Hightouch: Page view tracked");
            }
        );
    } catch (error) {
        console.error("Hightouch: Error tracking page view:", error);
    }
}

// Track initial page view
trackPageView();

// Initialize Checkout Started Form Tracking
function initializeFormEventListener() {
    const form = document.querySelector('form[action="/checkout/customer"]');

    if (form) {
        console.log("Form found. Adding submit event listener.");
        form.addEventListener("submit", function (event) {
            const customerFormData = {
                email: document.getElementById("customer_email")?.value || null,
                firstName: document.getElementById("customer_first_name")?.value || null,
                lastName: document.getElementById("customer_last_name")?.value || null,
                phone: document.getElementById("customer_phone")?.value || null
            };

            console.log("Form data to save:", customerFormData);

            // Save customerFormData to localStorage
            localStorage.setItem('customerFormData', JSON.stringify(customerFormData));
            console.log("Data saved to localStorage:", localStorage.getItem('customerFormData'));
        });
    } else {
        console.warn("Form with action '/checkout/customer' not found.");
    }
}
initializeFormEventListener();

// Function to extract on-screen data by class
function getOnScreenData() {
    try {
        const currencyIso = document.querySelector('.currency-iso')?.textContent.trim() || null;
        const paymentPlanTotal = document.querySelector('.value')?.textContent.trim() || null;
        const subtotal = document.querySelector('.amount')?.textContent.trim() || null;
        const installmentFee = document.querySelector('.fee amount')?.textContent.trim() || null;
        const orderTotal = document.querySelector('.total amount')?.textContent.trim() || null;
        const depositDue = document.querySelector('.down-payment')?.textContent.trim() || null;
        const remainingBalance = document.querySelector('.balance amount')?.textContent.trim() || null;
        const paymentFrequency = document.querySelector('.frequency')?.textContent.trim() || null;
        const numberOfPayments = document.querySelector('.num-payments amount')?.textContent.trim() || null;
        const paymentAmount = document.querySelector('.value')?.textContent.trim() || null;

        // Return as an object
        return {
            currencyIso,
            paymentPlanTotal,
            subtotal,
            installmentFee,
            orderTotal,
            depositDue,
            remainingBalance,
            paymentFrequency,
            numberOfPayments,
            paymentAmount,
        };
    } catch (error) {
        console.error("Error extracting on-screen data:", error);
        return {};
    }
}

// Function to track the "checkout_started" event
async function trackCheckoutInitiated() {
    const currentUrl = window.location.href;
    const targetSubstring = "partial.ly/checkout/confirm";

    if (currentUrl.includes(targetSubstring)) {
        try {
            // Retrieve customerFormData from localStorage
            const customerFormData = JSON.parse(localStorage.getItem('customerFormData')) || {};
            console.log("Retrieved customerFormData from localStorage:", customerFormData);

            const additionalParams = await getAdditionalParams();

            const payload = {
                ...additionalParams,
                ...customerFormData,
                ...onScreenData, // Include the on-screen data
            };

            console.log("Checkout started event payload:", payload);

            if (window.htevents && typeof window.htevents.track === 'function') {
                window.htevents.track(
                    "checkout_started",
                    payload,
                    () => console.log("Hightouch: 'checkout_started' event tracked successfully.")
                );
            } else {
                console.error("htevents.track is not defined.");
            }
        } catch (error) {
            console.error("Hightouch: Error tracking 'checkout_started' event:", error);
        }
    } else {
        console.log(`Hightouch: URL does not contain '${targetSubstring}'. 'checkout_started' event not fired.`);
    }
}

// Call the function to track "checkout_started" if conditions are met
trackCheckoutInitiated();

// Function to track the "checkout_completed" event
async function trackCheckoutCompleted() {
    const currentUrl = window.location.href;
    const targetSubstring = "partial.ly/checkout/confirmed";

    // Check if the current URL contains the target substring
    if (currentUrl.includes(targetSubstring)) {
        try {
            const additionalParams = await getAdditionalParams();
            
            if (window.htevents && typeof window.htevents.track === 'function') {
                window.htevents.track(
                    "checkout_completed", // Event name
                    {
                        ...additionalParams
                    },
                    () => console.log("Hightouch: 'checkout_completed' event tracked successfully.")
                );
            } else {
                console.error("htevents.track is not defined.");
            }
        } catch (error) {
            console.error("Hightouch: Error tracking 'checkout_completed' event:", error);
        }
    } else {
        console.log(`Hightouch: URL does not contain '${targetSubstring}'. 'checkout_completed' event not fired.`);
    }
}

// Call the function to track "checkout_completed" if conditions are met
    trackCheckoutCompleted();
