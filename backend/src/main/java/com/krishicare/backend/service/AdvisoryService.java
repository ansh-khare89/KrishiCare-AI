package com.krishicare.backend.service;

import org.springframework.stereotype.Service;

@Service
public class AdvisoryService {

    public String generateAdvisory(String className) {
        if (className == null) {
            return "No specific disease details available. Please consult a local agricultural advisor.";
        }

        switch (className) {
            case "Tomato___healthy":
                return "Your tomato crop is healthy! Maintain regular watering at the base of the plant, ensure 6-8 hours of direct sunlight, and continue scouting weekly for any signs of pests.";

            case "Tomato___Early_blight":
                return "Early Blight detected. Recommended actions: Prune infected lower leaves to prevent spore splash, apply organic copper fungicides, avoid overhead sprinkler watering, and space plants out to enhance airflow.";

            case "Tomato___Late_blight":
                return "Late Blight detected (HIGH RISK). Recommended actions: Immediately isolate and destroy severely infected foliage, apply fungicides containing chlorothalonil or copper, avoid humid foliage environments, and do not plant tomatoes near potatoes.";

            case "Potato___healthy":
                return "Your potato crop is healthy! Continue hilling the soil around the vines to cover developing tubers, monitor soil moisture to prevent waterlogging, and ensure balanced crop nutrition.";

            case "Potato___Early_blight":
                return "Early Blight detected. Recommended actions: Practice crop rotation next season, prune and discard spotted leaves, apply protectant fungicides (mancozeb or chlorothalonil), and keep foliage dry by watering in the early morning.";

            case "Potato___Late_blight":
                return "Late Blight detected (HIGH RISK). Recommended actions: Rapidly kill and remove infected vines before harvest to prevent tuber rot, spray systemic fungicides immediately, and harvest tubers during dry weather to reduce moisture levels.";

            default:
                return "Crop disease status unknown. Please maintain standard watering, prune dry leaves, and consult with local extension services.";
        }
    }
}
