import axios from 'axios';

export const geocodeAddress = async (address) => {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            return { 
                latitude: lat, 
                longitude: lng 
            };
        }
        
        throw new Error(response.data.status || 'No results found');
    } catch (error) {
        console.error("Geocoding error:", error.message);
        throw error;
    }
};