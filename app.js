// CLIENT: TOPEKA
// HIGHTOUCH EVENTS APP.JS FILE
// VERSION 7.1
// LAST UPDATED: 1/17/2024 AT 2:03 PM PT

console.log("Hightouch Events app.js script loaded");

// Function to hash a string using SHA-256
async function hashSHA256(value) {
    if (!value) return null;

    const encoder = new TextEncoder();
    const data = encoder.encode(value.trim().toLowerCase()); // Convert to lowercase as required by Facebook
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // Convert bytes to hex
}

// Function to collect and hash advanced matching parameters
async function getAdvancedMatchingParameters() {
    const customerFormData = JSON.parse(localStorage.getItem('customerFormData')) || {};

    const email = customerFormData.email || null;
    const phone = customerFormData.phone || null;
    const firstName = customerFormData.firstName || null;
    const lastName = customerFormData.lastName || null;

    return {
        em: email ? await hashSHA256(email) : null,
        ph: phone ? await hashSHA256(phone) : null,
        fn: firstName ? await hashSHA256(firstName) : null,
        ln: lastName ? await hashSHA256(lastName) : null,
    };
}

// TIKTOK: Function to collect and hash advanced matching parameters
async function getAdvancedMatchingParametersTT() {
    const customerFormData = JSON.parse(localStorage.getItem('customerFormData')) || {};

    const email = customerFormData.email || null;
    const phone = customerFormData.phone || null;

    return {
        email: email ? await hashSHA256(email) : null,
        phone_number: phone ? await hashSHA256(phone) : null,
    };
}

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

// Function to extract vacation ID based on product description keywords
function getVacationId() {
    try {
        const firstProductDesc = document.querySelector('.products .desc')?.textContent.trim();
        if (firstProductDesc) {
            if (firstProductDesc.includes('LADYWORLD')) {
                return "LW25"; // Vacation ID for LADYWORLD
            } else if (firstProductDesc.includes('Odies Beach Weekend')) {
                return "OD25"; // Vacation ID for ODIES
            } else if (firstProductDesc.includes('Whiskey Moon')) {
                return "WM25"; // Vacation ID for ODIES
            } else if (firstProductDesc.includes('Bootleggers Bonfire')) {
                return "BB25"; // Vacation ID for ODIES
            }
        }
        return null; // Return null if no match
    } catch (error) {
        console.error("Error extracting vacation ID:", error);
        return null;
    }
}

console.log("GA4: Google Tag initialized with ID: G-LVNXE75QV1");

// Track Page Views
async function trackPageView() {
    try {
        const additionalParams = await getAdditionalParams();
        const vacationID = await getVacationId();

         // Facebook Advanced Matching Parameters
        const advancedMatchingParams = await getAdvancedMatchingParameters();

        // Hightouch Page View Event
        window.htevents.page(
            "partial.ly",
            "page_viewed",
            {
                ...additionalParams,
                vacation_id: vacationID,
            },
            function() {
                console.log("Hightouch: Page view tracked");
            }
        );

        // Facebook Pixel Page View Event
        fbq('track', 'PageView', {}, {
            external_id: getDeviceId(),
            eventID: generateGUID(),
            advancedMatchingParams,
            vacation_id: vacationID,

    });
    console.log("Facebook Pixel: 'PageView' Event Tracked");


        // GA4: Page View Event
        gtag('event', 'page_view', {
            'send_to': 'G-LVNXE75QV1',
            'user_id': getDeviceId(),
            'event_id': generateGUID(),
        });
        console.log("GA4: Page view event fired to Google Tag");

        // TikTok: Page View Event
        try {  
            // Identity Call
            ttq.identify({
              "external_id": getDeviceId(),
                ...getAdvancedMatchingParametersTT
            });
            
            // Event Call
            ttq.page({
              "event_id": generateGUID(),
            });  
            
            console.log("TikTok Pixel: 'PageView' Event Successfully Tracked:", event);
          } catch (error) {
            console.error("TikTok Pixel: 'PageView' Event Tracking Failed:", error);
          }

    } catch (error) {
        console.error("Hightouch: Error tracking page view:", error);
    }
}

// Track initial page view
trackPageView();

function formatPrice(value) {
    if (!value) return null;
    const floatValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(floatValue) ? null : Math.floor(floatValue);
}

function formatFrequency(frequency) {
    if (!frequency) return null;
    const numericValue = parseFloat(frequency.replace('month', '').trim());
    return isNaN(numericValue) ? null : numericValue;
}

function formatPhone(phone) {
    if (!phone) return null;

    // Remove non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Check for valid length (assumes US-based or international phone numbers)
    if (cleaned.length === 10) {
        return `+1${cleaned}`; // Assuming US-based
    } else if (cleaned.length > 10) {
        return `+${cleaned}`;
    }

    return null; // Return null if invalid
}


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
                phone: formatPhone(document.getElementById("customer_phone")?.value || null),
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
        const paymentPlanTotal = formatPrice(document.querySelector('.value')?.textContent);
        const paymentPlanTotalInt = paymentPlanTotal && !isNaN(paymentPlanTotal) 
            ? Math.floor(paymentPlanTotal) 
            : null;

        const subtotal = formatPrice(document.querySelector('.details tr:nth-child(1) .amount')?.textContent);
        const downPayment = formatPrice(document.querySelector('.details .down-payment')?.textContent);
        const installmentFee = formatPrice(document.querySelector('.fee.amount')?.textContent);
        const orderTotal = formatPrice(document.querySelector('.details .total.amount')?.textContent);
        const depositDue = formatPrice(document.querySelector('.down-payment')?.textContent);
        const remainingBalance = formatPrice(document.querySelector('.details .balance.amount strong')?.textContent);
        const paymentFrequency = formatFrequency(document.querySelector('.frequency')?.textContent);
        const numberOfPayments = parseInt(document.querySelector('.num-payments.amount')?.textContent.trim(), 10) || null;
        const paymentAmount = formatPrice(document.querySelector('.value')?.textContent);

        const onScreenData = {
            currencyIso,
            paymentPlanTotal: paymentPlanTotalInt,
            subtotal,
            downPayment,
            installmentFee,
            orderTotal,
            depositDue,
            remainingBalance,
            paymentFrequency,
            numberOfPayments,
            paymentAmount,
        };

        localStorage.setItem('onScreenData', JSON.stringify(onScreenData));
        console.log("On-screen data stored in local storage:", onScreenData);

        return onScreenData;
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
            const additionalParams = await getAdditionalParams();
            const advancedMatchingParams = await getAdvancedMatchingParameters();
            let customerFormData = {};
            try {
                customerFormData = JSON.parse(localStorage.getItem('customerFormData')) || {};
            } catch (error) {
                console.error("Error parsing customerFormData from localStorage:", error);
            }
            const onScreenData = getOnScreenData();
            const vacationID = await getVacationId();
            const { currencyIso = "USD", paymentPlanTotal = 0 } = onScreenData || {};

            if (window.htevents && typeof window.htevents.track === 'function') {
                window.htevents.track(
                    "checkout_started",
                    {
                        ...additionalParams,
                        ...customerFormData,
                        ...onScreenData,
                        vacation_id: vacationID,
                    },
                    () => console.log("Hightouch: 'checkout_started' event tracked successfully with on-screen data.")
                );
            } else {
                console.error("htevents.track is not defined.");
            }

            // Facebook Pixel tracking
            if (currencyIso && paymentPlanTotal) {
                fbq('track', 'InitiateCheckout', {
                    currency: currencyIso,
                    value: paymentPlanTotal,
                }, {
                    ...advancedMatchingParams,
                    eventID: generateGUID(),
                    external_id: getDeviceId(),
                    vacation_id: vacationID,
                });
                console.log("Facebook Pixel: 'InitiateCheckout' Event Tracked:", { currency: currencyIso, value: paymentPlanTotal });
            } else {
                console.warn("Facebook Pixel: Missing data for 'InitiateCheckout' event. Skipping...");
            }

            // Google Ads Conversion Event
            if (typeof gtag === "function") {
                gtag('event', 'conversion', {
                    'send_to': 'AW-11394685026/CkZBCKmr9vUZEOKwtLkq',
                    'value': paymentPlanTotal || 0,
                    'currency': currencyIso || 'USD',
                });
                console.log("Google Ads: Begin Checkout event fired with data:", {
                    value: paymentPlanTotal,
                    currency: currencyIso,
                });
            } else {
                console.warn("Google Ads: 'gtag' is not defined. Skipping Begin Checkout conversion event.");
            }


            // GA4: Begin Checkout
            gtag('event', 'begin_checkout', {
                'send_to': 'G-LVNXE75QV1',
                'user_id': getDeviceId(),
                'event_id': generateGUID(),
                'currency': currencyIso,
                'value': paymentPlanTotal,
            });
            console.log("GA4: Begin Checkout event fired to Google Tag");

            // TikTok: InitiateCheckout Event
            try {  
                // Identity Call
                ttq.identify({
                    "external_id": getDeviceId(),
                    ...getAdvancedMatchingParametersTT
                });
            
                // Event Call
                ttq.track('InitiateCheckout', {
                    "event_id": generateGUID(),
                    "value": paymentPlanTotal,
                    "currency": currencyIso,
                    "vacation_id": vacationID,
                });  
                
                console.log("TikTok Pixel: 'InitiateCheckout' Event Successfully Tracked:");
              } catch (error) {
                console.error("TikTok Pixel: 'InitiateCheckout' Event Tracking Failed:", error);
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







// Function to track the "checkout_completed" event on button press
async function trackCheckoutCompletedOnButtonPress() {
    try {
        // Locate the submit button using its ID
        const form = document.getElementById('payment-form');

        if (!form) {
            console.warn("Payment form not found. Unable to track checkout.");
            return;
        }
        
        console.log("Payment form found. Adding click event listener.");

        // Add a click event listener to the submit button
        form.addEventListener('submit', async function (event) {
            (async () => {
                try {
                    // Fetch additional parameters and form data
                    const additionalParams = await getAdditionalParams();
                    const advancedMatchingParams = await getAdvancedMatchingParameters();
                    const customerFormData = JSON.parse(localStorage.getItem('customerFormData')) || {};
                    const onScreenData = getOnScreenData();
                    const vacationID = getVacationId();

                    // Hightouch tracking
                    window.htevents.track(
                        "checkout_completed", // Event name
                        {
                            ...additionalParams,
                            ...customerFormData,
                            ...onScreenData,
                            vacation_id: vacationID,
                        },
                        () => console.log("Hightouch: 'checkout_completed' event tracked successfully.")
                    );


                    // Facebook Pixel tracking
                    const { currencyIso = "USD", paymentPlanTotal = 0 } = onScreenData || {};
                    fbq('track', 'Purchase', {
                        currency: currencyIso,
                        value: paymentPlanTotal,
                    }, {
                        ...advancedMatchingParams,
                        eventID: generateGUID(),
                        external_id: getDeviceId(),
                        vacation_id: vacationID,
                    });
                    console.log("Facebook Pixel: 'Purchase' Event Tracked:", { currency: currencyIso, value: paymentPlanTotal });
                    

                    // Google Ads Conversion Event
                    gtag('event', 'conversion', {
                        'send_to': 'AW-11394685026/BMCCCM_K-uYZEOKwtLkq',
                        'value': paymentPlanTotal || 0,
                        'currency': currencyIso || 'USD',
                    });
                    console.log("Google Ads: Checkout completed event fired with data:", {
                        value: paymentPlanTotal,
                        currency: currencyIso,
                    });

                    // GA4: Purchase Checkout
                    gtag('event', 'purchase', {
                        'send_to': 'G-LVNXE75QV1',
                        'user_id': getDeviceId(),
                        'event_id': generateGUID(),
                        'currency': currencyIso,
                        'value': paymentPlanTotal,
                    });
                    console.log("GA4: Purchase event fired to Google Tag");
                    

                    // TikTok: PlaceAnOrder Event
                    const tiktokMatchingParams = await getAdvancedMatchingParametersTT();
                    // Identity Call
                    ttq?.identify({
                        "external_id": getDeviceId(),
                        ...tiktokMatchingParams
                    });
                
                    // Event Call
                    ttq?.track('PlaceAnOrder', {
                        "event_id": generateGUID(),
                        "value": paymentPlanTotal,
                        "currency": currencyIso,
                        "vacation_id": vacationID,
                    });
                    console.log("TikTok Pixel: 'PlaceAnOrder' Event Successfully Tracked.");
                } catch (error) {
                    console.error ("Error during tracking:", error);
                }
            })();
        });
    } catch (error) {
        console.error("Hightouch: Error on 'checkout_completed' event", error);
    }
}

// Initialize tracking for "checkout_completed" on button press
trackCheckoutCompletedOnButtonPress();
