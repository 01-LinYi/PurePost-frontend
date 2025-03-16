import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/components/SessionProvider";

const UserGuidePolicy = () => {
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(tab || "termsOfService");
  const { user, logOut } = useSession();

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const renderContent = () => {
    switch (activeTab) {
      case "userGuide":
        return <UserGuideContent />;
      case "termsOfService":
        return <TermsOfServiceContent />;
      case "privacyPolicy":
        return <PrivacyPolicyContent />;
      default:
        return <TermsOfServiceContent />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#00c5e3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PurePost Legal</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "termsOfService" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("termsOfService")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "termsOfService" && styles.activeTabText,
            ]}
          >
            Terms of Service
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "privacyPolicy" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("privacyPolicy")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "privacyPolicy" && styles.activeTabText,
            ]}
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "userGuide" && styles.activeTab]}
          onPress={() => setActiveTab("userGuide")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "userGuide" && styles.activeTabText,
            ]}
          >
            User Guide
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView style={styles.contentContainer}>
          {renderContent()}
        </ScrollView>

        <View style={styles.agreementButtonContainer}>
          <TouchableOpacity
            style={styles.agreementButton}
            onPress={() => router.back()}
          >
            <Text style={styles.agreementButtonText}>I AGREE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notagreementButton}
            onPress={() => {
              Alert.alert("Bye");
              if (user !== null) {
                logOut();
                router.push("/login");
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.agreementButtonText}>DECLINE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const UserGuideContent = () => (
  <View style={styles.contentSection}>
    <Text style={styles.sectionTitle}>Welcome to PurePost</Text>

    <Text style={styles.sectionSubtitle}>Getting Started</Text>
    <Text style={styles.paragraph}>
      PurePost is a social platform for sharing moments from your life. After
      registering, you can post content, follow friends, and interact with the
      community.
    </Text>

    <Text style={styles.sectionSubtitle}>Creating Posts</Text>
    <Text style={styles.paragraph}>
      1. Tap the "+" icon in the bottom navigation bar to create a new post
    </Text>
    <Text style={styles.paragraph}>2. Upload photos or videos (up to 9)</Text>
    <Text style={styles.paragraph}>3. Add a description and tags</Text>
    <Text style={styles.paragraph}>
      4. Tap "Post" to share with your followers
    </Text>

    <Text style={styles.sectionSubtitle}>Exploring & Interacting</Text>
    <Text style={styles.paragraph}>
      • Browse trending content and recommendations in the "Discover" page
    </Text>
    <Text style={styles.paragraph}>• Tap ❤️ to like content you enjoy</Text>
    <Text style={styles.paragraph}>
      • Communicate with other users through comments
    </Text>
    <Text style={styles.paragraph}>• Use @ to mention specific users</Text>

    <Text style={styles.sectionSubtitle}>Account Management</Text>
    <Text style={styles.paragraph}>In the "Profile" page, you can:</Text>
    <Text style={styles.paragraph}>• Edit your profile information</Text>
    <Text style={styles.paragraph}>• Manage privacy settings</Text>
    <Text style={styles.paragraph}>• View your activity history</Text>
    <Text style={styles.paragraph}>• Contact support</Text>

    <Text style={styles.sectionSubtitle}>Getting Help</Text>
    <Text style={styles.paragraph}>
      If you have any questions, please visit "Settings &gt; Help & Support" or
      email support@purepost.com.
    </Text>
  </View>
);

const TermsOfServiceContent = () => (
  <View style={styles.contentSection}>
    <Text style={styles.sectionTitle}>Terms of Service</Text>
    <Text style={styles.lastUpdated}>Last updated: Mar 3, 2025</Text>

    <Text style={styles.paragraph}>
      Welcome to PurePost! BY CLICKING “I AGREE,” YOU ACKNOWLEDGE THAT YOU HAVE
      READ AND AGREE that the following terms and conditions govern the
      examination, certification and any services under this terms.
    </Text>

    <Text style={styles.sectionSubtitle}>1. Acceptance of Terms</Text>
    <Text style={styles.paragraph}>
      By using our services, you agree to these terms. If you do not agree with
      these terms, please do not use our services.
    </Text>

    <Text style={styles.sectionSubtitle}>2. Account Responsibility</Text>
    <Text style={styles.paragraph}>
      You are responsible for maintaining the security of your account password.
      We strongly recommend using a complex password and changing it regularly.
      You must promptly notify PurePost of any unauthorized use of your account.
    </Text>

    <Text style={styles.sectionSubtitle}>3. User Conduct</Text>
    <Text style={styles.paragraph}>You agree that you will not:</Text>
    <Text style={styles.paragraph}>
      • Post content that is illegal, harmful, threatening, abusive, harassing,
      defamatory, or offensive
    </Text>
    <Text style={styles.paragraph}>
      • Impersonate another person or misrepresent your relationship with any
      person or entity
    </Text>
    <Text style={styles.paragraph}>
      • Post content that infringes on the intellectual property rights of
      others
    </Text>
    <Text style={styles.paragraph}>
      • Use the service for any illegal activity
    </Text>

    <Text style={styles.sectionSubtitle}>4. Content Ownership</Text>
    <Text style={styles.paragraph}>
      Users retain all rights to content they post. However, by submitting
      content to PurePost, you grant PurePost a worldwide, non-exclusive,
      royalty-free license to use, copy, modify, and display your content.
    </Text>

    <Text style={styles.sectionSubtitle}>5. Service Changes</Text>
    <Text style={styles.paragraph}>
      PurePost may modify or terminate the service at any time, without notice.
      We reserve the right to remove any content at any time for any reason.
    </Text>

    <Text style={styles.sectionSubtitle}>6. Account Termination</Text>
    <Text style={styles.paragraph}>
      PurePost reserves the right to terminate your account at any time for any
      reason, including but not limited to a violation of these Terms of
      Service.
    </Text>

    <Text style={styles.sectionSubtitle}>7. Disclaimer</Text>
    <Text style={styles.paragraph}>
      PurePost services are provided "as is" without warranty of any kind,
      either express or implied.
    </Text>

    <Text style={styles.sectionSubtitle}>8. Contact Information</Text>
    <Text style={styles.paragraph}>
      If you have any questions, please contact legal@purepost.com .
    </Text>
  </View>
);

const PrivacyPolicyContent = () => (
  <View style={styles.contentSection}>
    <Text style={styles.sectionTitle}>Privacy Policy</Text>
    <Text style={styles.lastUpdated}>Last updated: Mar 3, 2025</Text>

    <Text style={styles.paragraph}>
      PurePost values your privacy. This policy explains how we collect, use,
      and protect your personal information.
    </Text>

    <Text style={styles.sectionSubtitle}>1. Information Collection</Text>
    <Text style={styles.paragraph}>
      We collect the following types of information:
    </Text>
    <Text style={styles.paragraph}>
      • Registration information: username, email, password, etc.
    </Text>
    <Text style={styles.paragraph}>
      • Profile information: avatar, bio, location, etc.
    </Text>
    <Text style={styles.paragraph}>
      • Content data: photos, videos, comments you post
    </Text>
    <Text style={styles.paragraph}>
      • Usage data: login times, interaction records, device information, etc.
    </Text>

    <Text style={styles.sectionSubtitle}>2. Use of Information</Text>
    <Text style={styles.paragraph}>We use your information to:</Text>
    <Text style={styles.paragraph}>
      • Provide, maintain, and improve our services
    </Text>
    <Text style={styles.paragraph}>• Personalize your experience</Text>
    <Text style={styles.paragraph}>
      • Send service notifications and updates
    </Text>
    <Text style={styles.paragraph}>
      • Protect user safety and platform integrity
    </Text>

    <Text style={styles.sectionSubtitle}>3. Sharing of Information</Text>
    <Text style={styles.paragraph}>
      We do not sell your personal information. We may share information in the
      following circumstances:
    </Text>
    <Text style={styles.paragraph}>
      • With other users according to your settings
    </Text>
    <Text style={styles.paragraph}>
      • With service providers who offer technical support
    </Text>
    <Text style={styles.paragraph}>
      • When required by law or to protect rights
    </Text>

    <Text style={styles.sectionSubtitle}>4. Data Security</Text>
    <Text style={styles.paragraph}>
      We take reasonable measures to protect your personal information from
      unauthorized access or disclosure. However, no internet transmission or
      electronic storage method is 100% secure.
    </Text>

    <Text style={styles.sectionSubtitle}>5. Your Choices</Text>
    <Text style={styles.paragraph}>You can:</Text>
    <Text style={styles.paragraph}>
      • Update or delete your account information
    </Text>
    <Text style={styles.paragraph}>
      • Adjust privacy settings to control information sharing
    </Text>
    <Text style={styles.paragraph}>• Opt out of marketing communications</Text>
    <Text style={styles.paragraph}>• Request deletion of your account</Text>

    <Text style={styles.sectionSubtitle}>6. Children's Privacy</Text>
    <Text style={styles.paragraph}>
      PurePost services are not directed at children under 13. If we learn we
      have collected personal information from a child under 13, we will take
      steps to delete that information.
    </Text>

    <Text style={styles.sectionSubtitle}>7. Policy Changes</Text>
    <Text style={styles.paragraph}>
      We may update this Privacy Policy from time to time. We will notify you of
      significant changes via in-app notification or email.
    </Text>

    <Text style={styles.sectionSubtitle}>8. Contact Us</Text>
    <Text style={styles.paragraph}>
      If you have any privacy concerns, please contact privacy@purepost.com.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#00c5e3",
    marginLeft: 16,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#00c5e3",
  },
  tabText: {
    fontSize: 15,
    color: "#666",
  },
  activeTabText: {
    color: "#00c5e3",
    fontWeight: "600",
  },
  contentWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentSection: {
    paddingVertical: 20,
    paddingBottom: 80, // Extra padding at the bottom for better scrolling and button visibility
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    fontStyle: "italic",
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
    marginBottom: 8,
  },
  agreementButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  agreementButton: {
    backgroundColor: "#00c5e3",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  notagreementButton: {
    backgroundColor: "red",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  agreementButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UserGuidePolicy;
