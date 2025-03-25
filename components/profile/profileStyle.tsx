import { StyleSheet, Platform } from "react-native";

// 增强的颜色系统，基于主题色 #00c5e3
const COLORS = {
  primary: "#00c5e3",
  primaryLight: "#33d1ea",
  primaryDark: "#009cb6",
  secondary: "#34D399",
  accent: "#3B82F6",
  background: "#F9FAFB",
  cardBackground: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#4B5563",
  textLight: "#6B7280",
  divider: "#F3F4F6",
  // 新增颜色
  primaryTransparent: "rgba(0, 197, 227, 0.1)",
  primaryUltraLight: "rgba(0, 197, 227, 0.05)",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  scrollContainer: {
    paddingBottom: 20,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "500",
  },
  
  cacheInfoContainer: {
    backgroundColor: COLORS.primaryUltraLight,
    padding: 8,
    alignItems: "center",
    marginTop: 4,
    borderRadius: 8,
    marginHorizontal: 12,
  },
  
  cacheInfoText: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: "italic",
  },
  
  profileCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    margin: 12,
    padding: 16,
    paddingTop: 80,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  avatarSection: {
    alignItems: "center",
    position: "relative",
    marginTop: -70,
  },
  
  avatarGradientBorder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: COLORS.cardBackground,
  },
  
  userInfo: {
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "transparent",
  },
  
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
  },
  
  verifiedIcon: {
    marginLeft: 6,
  },
  
  username: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  
  email: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 3,
  },
  
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
    height: 42,
  },
  
  followingButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  
  mainButton: {
    width: "85%",
    marginVertical: 6,
    height: 44,
  },
  
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    paddingTop: 16,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryTransparent,
  },
  
  stat: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: "500",
  },
  
  bioSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    margin: 12,
    marginTop: 6,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 14,
  },
  
  bioItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingBottom: 16,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryUltraLight,
  },
  
  bioIcon: {
    marginRight: 14,
    marginTop: 2,
    color: COLORS.primary,
  },
  
  bioTextContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  
  bioLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  
  bioValue: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 3,
    lineHeight: 22,
  },
  
  settingsSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    margin: 12,
    marginTop: 6,
    padding: 8,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  
  settingText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 14,
    flex: 1,
    fontWeight: "500",
  },
  
  postSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    margin: 12,
    marginTop: 6,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  postContainer: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primaryUltraLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryTransparent,
    borderStyle: "dashed",
    marginTop: 10,
  },
  
  noPostText: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "500",
  },
});