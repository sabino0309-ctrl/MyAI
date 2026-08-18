package com.freea.storage;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ContextReader {

    public static String getRecentContext(int limit) {
        String sql = "SELECT user_prompt, ai_response FROM chat_logs ORDER BY created_at DESC LIMIT ?";
        StringBuilder contextBuilder = new StringBuilder();

        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, limit);
            ResultSet rs = pstmt.executeQuery();

            contextBuilder.append("--- HISTORICAL CONTEXT ---\n");
            while (rs.next()) {
                contextBuilder.append("User: ").append(rs.getString("user_prompt"))
                              .append(" | AI: ").append(rs.getString("ai_response"))
                              .append("\n");
            }

        } catch (SQLException e) {
            System.err.println("[Java ContextReader] Error reading DB: " + e.getMessage());
        }
        return contextBuilder.toString();
    }
}
