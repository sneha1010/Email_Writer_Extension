package com.email.writer.service;

import com.email.writer.DTO.EmailRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailGeneratorService {

    @Value("${grok.api.url}")
    private String grokApiUrl;
    @Value("${grok.api.key}")
    private String grokApiKey;

    private final WebClient webClient;

    public EmailGeneratorService(WebClient webClient) {
        this.webClient = webClient;
    }

    public String generateEmailResponse(EmailRequest emailRequest)
    {

        // Build prompt
        String prompt= buildPrompt(emailRequest);

        //Craft a request
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.3-70b-versatile"); // free & very capable
        requestBody.put("max_tokens", 1024);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content",
                        "You are a professional email assistant. Generate a " + emailRequest.getTone() + " email reply. Please don't generate a subject line."),
                Map.of("role", "user", "content",
                        "Generate a reply for this email: " + emailRequest.getEmailContent())
        ));
      // Do request and get response
        String response= webClient.post()
                .uri(grokApiUrl)
                .header("Content-Type","application/json")
                .header("Authorization","Bearer "+grokApiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

      return extractEmailFromResponse(response);
    }

    private String extractEmailFromResponse(String response) {
        try {
            ObjectMapper mapper= new ObjectMapper();
            JsonNode rootNode= mapper.readTree(response);
            JsonNode emailContentNode= rootNode.path("choices").get(0).path("message").path("content");
            return emailContentNode.asString();
        } catch (Exception e) {
            return "Error processing failed "+ e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {

        StringBuilder prompt= new StringBuilder();
        prompt.append("Generate a professional email reply for the following email content. Please don't generate a subject line. ");
        if(emailRequest.getTone()!=null&&!emailRequest.getTone().isEmpty())
        {
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone.");
        }
        prompt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
