import CompactHeader from "@/components/CompactHeader";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";

const sections = [
  {
    title: "Community Guidelines",
    icon: "people-circle-outline",
    iconType: "Ionicons",
    color: "#00c5e3",
    tip: "Be respectful and keep the community safe for everyone.",
  },
  {
    title: "Account Security",
    icon: "shield-check",
    iconType: "MaterialCommunityIcons",
    color: "#3ac569",
    tip: "Use strong, unique passwords and enable two-factor authentication.",
  },
  {
    title: "Content Creation",
    icon: "create-outline",
    iconType: "Ionicons",
    color: "#f9ca24",
    tip: "Share creative, original content to express yourself.",
  },
  {
    title: "Growth Strategies",
    icon: "chart-line",
    iconType: "MaterialCommunityIcons",
    color: "#e17055",
    tip: "Engage genuinely to grow your followers and connections.",
  },
  {
    title: "Digital Wellbeing",
    icon: "heart-circle-outline",
    iconType: "Ionicons",
    color: "#a29bfe",
    tip: "Take regular breaks for a healthy online-offline balance.",
  },
  {
    title: "App Features",
    icon: "bulb-outline",
    iconType: "Ionicons",
    color: "#fd79a8",
    tip: "Explore new features and settings to get the most out of the app.",
  },
];

const renderIcon = (section: any) => {
  const iconProps = {
    size: 26,
    color: section.color,
  };
  if (section.iconType === "Ionicons") {
    return (
      <Ionicons name={section.icon} {...iconProps} style={styles.sectionIcon} />
    );
  } else if (section.iconType === "MaterialCommunityIcons") {
    return (
      <MaterialCommunityIcons
        name={section.icon}
        {...iconProps}
        style={styles.sectionIcon}
      />
    );
  }
};



const renderSection = (section: any, idx: any, router:any) => {
  if (section.title === "Community Guidelines") {
    return (
      <View
        key={idx}
        style={[styles.tipCard, { borderLeftColor: section.color }]}
      > 
        <TouchableOpacity
          onPress={() => router.push("/guidePolicy")}>
        <View style={styles.tipHeader}>
          {renderIcon(section)}
          <Text style={[styles.tipTitle, { color: section.color }]}>
            {section.title}
          </Text>
        </View>
        <Text style={styles.tipText}>{section.tip}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View
      key={idx}
      style={[styles.tipCard, { borderLeftColor: section.color }]}
    >
      <View style={styles.tipHeader}>
        {renderIcon(section)}
        <Text style={[styles.tipTitle, { color: section.color }]}>
          {section.title}
        </Text>
      </View>
      <Text style={styles.tipText}>{section.tip}</Text>
    </View>
  );
};

export default function ResourcesTipsScreen() {
  const router = useRouter();
  return (
    <>
      <CompactHeader title="Quick Tips" onBack={() => router.back()} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.pageTitle}>Quick Tips</Text>
        <Text style={styles.pageDescription}>
          Simple advice for a better social experience.
        </Text>
        {sections.map((section, idx) => renderSection(section, idx, router))}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>PurePost v0.1</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fcfe",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00c5e3",
    marginTop: 10,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  pageDescription: {
    fontSize: 15,
    color: "#555",
    marginBottom: 16,
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 18,
    padding: 16,
    borderLeftWidth: 5,
    elevation: 1,
    shadowColor: "#bbb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 5,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionIcon: {
    marginRight: 10,
  },
  tipTitle: {
    fontSize: 16.5,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
  tipText: {
    fontSize: 14.5,
    color: "#444",
    lineHeight: 19,
    paddingLeft: 2,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  footerText: {
    color: "#bbb",
    fontSize: 12.5,
    letterSpacing: 0.5,
  },
});
