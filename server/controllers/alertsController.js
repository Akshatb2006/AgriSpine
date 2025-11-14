const Alert = require('../models/Alert');

exports.getAll = async (req, res) => {
    try{
        const farmerId = req.user.id;
        let alerts = await Alert.find({farmerId, $or: [{expiresAt: {$gt: new Date()}}]}).sort({createdAt: -1});
        if(alerts.length === 0){
            const seed = await Alert.insertMany([
                {
                    farmerId,
                    type: 'pest',
                    severity: 'high',
                    title: 'Aphid Infestation Detected',
                    description: 'Early signs of aphid infestation detected in Field 3',
                    actionRequired: true,
                    recommendations: ['Apply neem oil spray immediately','Monitor daily for spread','Introduce ladybugs as predators'],
                    isRead: false,
                    expiresAt: new Date(Date.now() + 7*24*60*60*1000)
                },
                {
                    farmerId,
                    type: 'irrigation',
                    severity: 'medium',
                    title: 'Water Stress Detected',
                    description: 'Moderate water stress detected in Field 1',
                    actionRequired: true,
                    recommendations: ['Increase irrigation frequency by 15%','Check soil moisture levels','Monitor rainfall forecast'],
                    isRead: false,
                    expiresAt: new Date(Date.now() + 3*24*60*60*1000)
                },
                {
                    farmerId,
                    type: 'weather',
                    severity: 'low',
                    title: 'Favorable Weather Conditions',
                    description: 'Optimal conditions for crop growth expected for next week',
                    actionRequired: false,
                    recommendations: ['Continue current practices','Consider applying fertilizer'],
                    isRead: true,
                    expiresAt: new Date(Date.now() + 7*24*60*60*1000)
                  }
            ]);
            alerts = seed;
        }
        return res.status(200).json({success: true, data :alerts});
    } catch(err){
        console.log(`Alert fetch error: ${err.message}`);
        return res.status(500).json({success: false, error: 'Failed to fetch alerts'});
    }
}