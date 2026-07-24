package com.krishicare.backend.service;

import org.springframework.stereotype.Service;

@Service
public class AdvisoryService {

    public String generateAdvisory(String className) {
        if (className == null) {
            return "No specific disease details available. Please consult a local agricultural advisor.";
        }

        // Extract crop and disease from class name
        String[] parts = className.split("___");
        String crop = parts.length > 0 ? parts[0].toLowerCase() : "";
        String disease = parts.length > 1 ? parts[1].toLowerCase() : "";

        // Generate advisory based on crop and disease
        if (disease.contains("healthy")) {
            return generateHealthyAdvisory(crop);
        }

        return generateDiseaseAdvisory(crop, disease, className);
    }

    private String generateHealthyAdvisory(String crop) {
        return switch (crop) {
            case "tomato" -> "Your tomato crop is healthy! Maintain regular watering at the base of the plant, ensure 6-8 hours of direct sunlight, and continue scouting weekly for any signs of pests.";
            case "potato" -> "Your potato crop is healthy! Continue hilling the soil around the vines to cover developing tubers, monitor soil moisture to prevent waterlogging, and ensure balanced crop nutrition.";
            case "corn_(maize)" -> "Your corn crop is healthy! Ensure adequate nitrogen fertilization, monitor for pest activity, and maintain consistent soil moisture during tasseling and silking.";
            case "apple" -> "Your apple trees are healthy! Continue regular pruning, maintain proper spacing for airflow, and monitor for pest activity during growing season.";
            case "grape" -> "Your grape vines are healthy! Continue canopy management for sunlight exposure, monitor soil moisture, and maintain proper trellising system.";
            case "pepper,_bell" -> "Your pepper plants are healthy! Maintain consistent soil moisture, provide support for heavy fruit, and monitor for aphids and other common pests.";
            case "peach" -> "Your peach trees are healthy! Continue regular watering during fruit development, thin fruit for better size, and monitor for pest activity.";
            case "cherry_(including_sour)" -> "Your cherry trees are healthy! Protect fruit from birds with netting, maintain consistent soil moisture, and continue regular pruning.";
            case "strawberry" -> "Your strawberry plants are healthy! Keep runners under control, maintain consistent watering, and protect fruit from soil contact with mulch.";
            case "orange" -> "Your orange trees are healthy! Continue regular watering, fertilize with citrus-specific nutrients, and monitor for pest activity.";
            case "squash" -> "Your squash plants are healthy! Monitor for squash bugs and vine borers, maintain consistent soil moisture, and harvest regularly to encourage continued production.";
            case "blueberry" -> "Your blueberry bushes are healthy! Maintain acidic soil pH (4.5-5.5), ensure consistent moisture, and protect fruit from birds with netting.";
            case "soybean" -> "Your soybean crop is healthy! Monitor for pest activity, ensure adequate soil moisture during pod fill, and prepare for timely harvest.";
            default -> "Your crop appears healthy! Continue regular monitoring, maintain proper irrigation, and follow standard agricultural practices for your region.";
        };
    }

    private String generateDiseaseAdvisory(String crop, String disease, String className) {
        // Handle specific high-risk diseases with detailed advisories
        if (disease.contains("blight") || disease.contains("curl") || disease.contains("greening")) {
            return generateHighRiskAdvisory(className);
        }

        // Handle fungal diseases
        if (disease.contains("spot") || disease.contains("mold") || disease.contains("rot") || disease.contains("mildew")) {
            return generateFungalAdvisory(className);
        }

        // Handle bacterial diseases
        if (disease.contains("bacterial")) {
            return generateBacterialAdvisory(className);
        }

        // Handle viral diseases
        if (disease.contains("virus") || disease.contains("mosaic")) {
            return generateViralAdvisory(className);
        }

        // Handle pest-related issues
        if (disease.contains("mite") || disease.contains("rust")) {
            return generatePestAdvisory(className);
        }

        // Default advisory
        return "Disease detected. Recommended actions: Remove infected plant material, improve airflow around plants, avoid overhead watering, apply appropriate fungicides or pesticides as needed, and consult with local agricultural extension services for specific treatment recommendations.";
    }

    private String generateHighRiskAdvisory(String className) {
        return switch (className) {
            case "Tomato___Late_blight" -> "Late Blight detected (HIGH RISK). Recommended actions: Immediately isolate and destroy severely infected foliage, apply fungicides containing chlorothalonil or copper, avoid humid foliage environments, and do not plant tomatoes near potatoes.";
            case "Potato___Late_blight" -> "Late Blight detected (HIGH RISK). Recommended actions: Rapidly kill and remove infected vines before harvest to prevent tuber rot, spray systemic fungicides immediately, and harvest tubers during dry weather to reduce moisture levels.";
            case "Tomato___Tomato_Yellow_Leaf_Curl_Virus" -> "Tomato Yellow Leaf Curl Virus detected (HIGH RISK). Recommended actions: Remove infected plants immediately, control whitefly populations with insecticides, use virus-resistant varieties in future plantings, and maintain weed control.";
            case "Orange___Haunglongbing_(Citrus_greening)" -> "Citrus Greening detected (HIGH RISK - NO CURE). Recommended actions: Remove infected trees to prevent spread, control Asian citrus psyllid population, monitor nearby trees, and use certified disease-free nursery stock.";
            default -> "High-risk disease detected. Take immediate action: isolate infected plants, apply appropriate treatments, remove severely affected material, and consult with agricultural experts for disease management.";
        };
    }

    private String generateFungalAdvisory(String className) {
        return "Fungal disease detected. Recommended actions: Prune infected leaves and plant parts, improve air circulation by proper spacing, avoid overhead irrigation, apply fungicides (copper-based or synthetic as appropriate), remove plant debris from area, and practice crop rotation.";
    }

    private String generateBacterialAdvisory(String className) {
        return "Bacterial disease detected. Recommended actions: Remove and destroy infected plant material, avoid working with plants when wet, apply copper-based bactericides, practice strict crop rotation, use disease-free seeds and transplants, and disinfect tools between uses.";
    }

    private String generateViralAdvisory(String className) {
        return "Viral disease detected. Recommended actions: Remove infected plants immediately (no cure), control insect vectors (aphids, whiteflies, etc.), use resistant varieties, practice weed control to eliminate alternate hosts, and sanitize tools and equipment.";
    }

    private String generatePestAdvisory(String className) {
        return "Pest-related damage detected. Recommended actions: Monitor pest population closely, apply appropriate insecticides or miticides, introduce beneficial insects for biological control, remove heavily infested leaves, and maintain plant health to resist pest pressure.";
    }
}
