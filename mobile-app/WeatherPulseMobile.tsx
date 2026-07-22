import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  SafeAreaView 
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function WeatherPulseMobile() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>☁️⚡</Text>
            <Text style={styles.logoText}>Weatherpulse</Text>
          </View>
          <View style={styles.searchContainer}>
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search" 
              placeholderTextColor="#7A829A"
            />
          </View>
        </View>

        <Text style={styles.dashboardTitle}>
          <Text style={styles.boldWhite}>Operations Dashboard</Text> | May 21, 2024 - 14:35 EST
        </Text>

        {/* Top Metrics - Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsRow}>
          <View style={[styles.metricCard, styles.glowYellow]}>
            <Text style={styles.metricCity}>New York</Text>
            <Text style={styles.metricData}>AQI: <Text style={styles.textYellow}>65 Moderate - Yellow</Text></Text>
          </View>
          <View style={[styles.metricCard, styles.glowOrange]}>
            <Text style={styles.metricCity}>Atlanta</Text>
            <Text style={styles.metricData}>UV Index: <Text style={styles.textOrange}>8 High - Orange</Text></Text>
          </View>
          <View style={[styles.metricCard, styles.glowGreen]}>
            <Text style={styles.metricCity}>Chicago</Text>
            <Text style={styles.metricData}>AQI: <Text style={styles.textGreen}>32 Good - Green</Text></Text>
          </View>
        </ScrollView>

        {/* Alerts Panel (Stacked for Mobile) */}
        <View style={[styles.panel, styles.glowRed, styles.alertsPanel]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitleText}>ALERTS PANEL</Text>
            <Text style={styles.closeIcon}>✕</Text>
          </View>
          <Text style={styles.alertHeadline}>
            Extreme <Text style={styles.textCyan}>Weather</Text>{"\n"}
            Detected: <Text style={styles.textRed}>1.5x{"\n"}Surge Pricing{"\n"}Activated</Text>
          </Text>
          
          <View style={styles.alertIconContainer}>
            <Text style={styles.stormIcon}>⛈️</Text>
            <Text style={styles.timestamp}>14:32:01</Text>
          </View>

          <View style={styles.alertDetails}>
            <Text style={styles.detailText}>Region: <Text style={styles.whiteText}>SE USA</Text></Text>
            <Text style={styles.detailText}>Event: <Text style={styles.whiteText}>Severe Thunderstorms</Text></Text>
            <Text style={styles.detailText}>Surge: <Text style={styles.whiteText}>Applied to 3 Clients</Text></Text>
          </View>
        </View>

        {/* Active Client Tenants */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Client Tenants</Text>
        </View>
        
        <View style={[styles.tenantCard, styles.glowCyan]}>
          <View style={styles.tenantHeader}>
            <Text style={styles.tenantName}>Global Logistics Inc.</Text>
            <Text style={styles.menuDots}>⋮</Text>
          </View>
          <View style={styles.tenantStatusRow}>
            <View style={styles.badgeActive}><Text style={styles.badgeTextActive}>Active</Text></View>
            <Text style={styles.alertCount}>14 Alerts</Text>
          </View>
        </View>

        <View style={[styles.tenantCard, styles.glowYellow]}>
          <View style={styles.tenantHeader}>
            <Text style={styles.tenantName}>Omni Solutions</Text>
            <Text style={styles.menuDots}>⋮</Text>
          </View>
          <View style={styles.tenantStatusRow}>
            <View style={styles.badgeWarning}><Text style={styles.badgeTextWarning}>Warning</Text></View>
            <Text style={styles.alertCount}>3 Alerts</Text>
          </View>
        </View>

        {/* Map Section */}
        <View style={[styles.panel, styles.glowCyan, styles.mapPanel]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitleText}>Active Weather Map</Text>
            <View style={styles.glowToggle}>
              <Text style={styles.glowToggleText}>Glow 🔵</Text>
            </View>
          </View>
          
          {/* WebView Interactive Radar */}
          <View style={styles.mapContainer}>
             <WebView 
               source={{ uri: 'https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=in&metricTemp=%C2%B0F&metricWind=mph&zoom=5&overlay=radar&product=radar&level=surface&lat=36.00&lon=-80.00&message=true' }}
               style={styles.webview}
               scrollEnabled={false}
             />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12141C',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  searchContainer: {
    flex: 1,
    marginLeft: 20,
    backgroundColor: '#1C1F2B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2E3F',
  },
  searchInput: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  dashboardTitle: {
    color: '#7A829A',
    fontSize: 14,
    marginBottom: 16,
  },
  boldWhite: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#1C1F2B',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#2A2E3F',
  },
  metricCity: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  metricData: {
    color: '#7A829A',
    fontSize: 13,
  },
  textYellow: { color: '#FFD700' },
  textOrange: { color: '#FF8C00' },
  textGreen: { color: '#00FF7F' },
  textCyan: { color: '#00E5FF' },
  textRed: { color: '#FF3366' },
  whiteText: { color: '#FFFFFF' },
  
  glowCyan: {
    borderColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  glowRed: {
    borderColor: '#FF3366',
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  glowYellow: {
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  glowOrange: {
    borderColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  glowGreen: {
    borderColor: '#00FF7F',
    shadowColor: '#00FF7F',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  panel: {
    backgroundColor: '#151720',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  alertsPanel: {
    alignItems: 'center',
  },
  panelHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  panelTitleText: {
    color: '#7A829A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  closeIcon: {
    color: '#7A829A',
    fontSize: 16,
  },
  alertHeadline: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 20,
  },
  alertIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stormIcon: {
    fontSize: 60,
    marginBottom: 8,
  },
  timestamp: {
    color: '#7A829A',
    fontSize: 14,
  },
  alertDetails: {
    width: '100%',
    backgroundColor: '#1C1F2B',
    padding: 16,
    borderRadius: 8,
  },
  detailText: {
    color: '#7A829A',
    fontSize: 13,
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tenantCard: {
    backgroundColor: '#1C1F2B',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tenantName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuDots: {
    color: '#7A829A',
    fontSize: 18,
  },
  tenantStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: 'rgba(0, 255, 127, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00FF7F',
  },
  badgeTextActive: {
    color: '#00FF7F',
    fontSize: 12,
  },
  badgeWarning: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  badgeTextWarning: {
    color: '#FFD700',
    fontSize: 12,
  },
  alertCount: {
    color: '#FF3366',
    fontSize: 13,
    fontWeight: '500',
  },
  mapPanel: {
    height: 400,
  },
  glowToggle: {
    backgroundColor: '#2A2E3F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  glowToggleText: {
    color: '#00E5FF',
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#1C1F2B',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    opacity: 0.8, // Slightly fade to match dark theme
  }
});
