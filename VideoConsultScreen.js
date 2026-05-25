import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const onlineServices = [
  {
    title: 'Request Nurse Callback',
    subtitle: 'A nurse will call you to assess your condition and guide next steps',
    icon: 'call-outline',
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    time: 'Within 2 hours',
    price: 'Free',
    suffix: '',
    note: 'Initial triage and assessment',
    badge: 'Beginner Friendly',
    pill: 'Always Free',
    button: 'Select Service',
  },
  {
    title: 'Chat Consultation',
    subtitle: 'Text with a doctor anytime',
    icon: 'chatbox-outline',
    iconColor: '#089FB4',
    iconBg: '#E0F7FA',
    buttonColor: '#0EA5E9',
    time: '24/7 availability',
    price: '$25',
    suffix: '/ session',
    note: 'One-time payment',
    button: 'Select Service',
  },
  {
    title: 'Voice Consultation',
    subtitle: 'Speak to a doctor by phone',
    icon: 'call-outline',
    iconColor: '#10B981',
    iconBg: '#D1FAE5',
    time: '15-20 minutes',
    price: '$35',
    suffix: '/ session',
    note: 'One-time payment',
    badge: 'Most Popular',
    button: 'Select Service',
  },
  {
    title: 'Video Consultation',
    subtitle: 'Face-to-face virtual visit',
    icon: 'videocam-outline',
    iconColor: '#089FB4',
    iconBg: '#DFF4FF',
    buttonColor: '#0EA5E9',
    time: '20-30 minutes',
    price: '$45',
    suffix: '/ session',
    note: 'One-time payment',
    badge: 'Recommended',
    featured: true,
    button: 'Select Service',
  },
];

const specialtyTags = [
  'Cardiology',
  'Dermatology',
  'Psychiatry',
  'Endocrinology',
  'Gastroenterology',
  'Orthopedics',
];

const therapyTags = [
  'Physical Therapy',
  'Occupational Therapy',
  'Speech Therapy',
  'PhilHealth Eligible',
];

const searchableServicesSeed = [
  ...onlineServices.map((service) => ({
    id: service.title,
    category: 'General Physician',
    searchText: [
      service.title,
      service.subtitle,
      service.time,
      service.price,
      service.note,
      service.badge,
      service.pill,
      'online virtual remote doctor primary care general physician consultation',
    ]
      .filter(Boolean)
      .join(' '),
  })),
  {
    id: 'Book Physical Consultation',
    category: 'In-Person Consultation',
    searchText:
      'Book Physical Consultation In-Person Consultation clinic appointment locations specialties flexible scheduling face to face doctor visit',
  },
  {
    id: 'Book Specialist Consultation',
    category: 'Specialist Services',
    searchText: [
      'Book Specialist Consultation Specialist Services specialized medical expertise stethoscope doctor expert care',
      ...specialtyTags,
    ].join(' '),
  },
  {
    id: 'Book Therapy Session',
    category: 'Rehabilitation Therapy',
    searchText: [
      'Book Therapy Session Rehabilitation Therapy recovery wellness rehab physical occupational speech therapy PhilHealth',
      ...therapyTags,
    ].join(' '),
  },
];

const serviceCategories = [
  'All',
  'General Physician',
  'In-Person Consultation',
  'Specialist Services',
  'Rehabilitation Therapy',
];

function AppHeader({ navigation }) {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIconText}>O+</Text>
        </View>

        <View>
          <Text style={styles.logoTitle}>OkieDoc+</Text>
          <Text style={styles.logoSubtitle}>Your Health Partner</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.bellIcon}>
        <Ionicons name="notifications-outline" size={20} color="#0F172A" />

        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function ModePill({ icon, label, active, activeColor, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.modePill,
        active && styles.modePillActive,
        active && { backgroundColor: activeColor, borderColor: activeColor },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={14} color={active ? '#FFFFFF' : '#0F172A'} />
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ServiceSearchBar({
  value,
  onChangeText,
  selectedCategory,
  onSelectCategory,
  resultCount,
}) {
  return (
    <View style={styles.searchPanel}>
      <Text style={styles.searchLabel}>Search healthcare services</Text>

      <View style={styles.searchInputWrap}>
        <Ionicons name="search-outline" size={19} color="#64748B" />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.searchInput}
          placeholder="Search by service name or category"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => onChangeText('')}
          >
            <Ionicons name="close" size={16} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {serviceCategories.map((category) => {
          const active = selectedCategory === category;

          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
              onPress={() => onSelectCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  active && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.searchResultText}>
        {resultCount} {resultCount === 1 ? 'service' : 'services'} found
      </Text>
    </View>
  );
}

function EmptySearchState({ onClear }) {
  return (
    <View style={styles.emptyStateCard}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="search-outline" size={28} color="#089FB4" />
      </View>

      <Text style={styles.emptyStateTitle}>No services found</Text>

      <Text style={styles.emptyStateText}>
        Try searching for a service name like “Video Consultation” or a category like
        “Specialist”.
      </Text>

      <TouchableOpacity style={styles.emptyStateButton} onPress={onClear}>
        <Text style={styles.emptyStateButtonText}>Clear Search</Text>
      </TouchableOpacity>
    </View>
  );
}

function ServiceCard({ service }) {
  return (
    <View style={[styles.serviceCard, service.featured && styles.featuredCard]}>
      {service.badge && (
        <View style={[styles.cardBadge, service.featured && styles.featuredBadge]}>
          <Ionicons
            name={
              service.featured
                ? 'sparkles'
                : service.title.includes('Nurse')
                  ? 'shield-checkmark-outline'
                  : 'checkmark-circle-outline'
            }
            size={11}
            color="#FFFFFF"
          />

          <Text style={styles.cardBadgeText}>{service.badge}</Text>
        </View>
      )}

      <View style={[styles.serviceIcon, { backgroundColor: service.iconBg }]}>
        <Ionicons name={service.icon} size={29} color={service.iconColor} />
      </View>

      <Text style={styles.serviceTitle}>{service.title}</Text>
      <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>

      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={14} color="#45627F" />
        <Text style={styles.timeText}>{service.time}</Text>
      </View>

      <View style={styles.divider} />

      {service.pill && (
        <View style={styles.freePill}>
          <Text style={styles.freePillText}>{service.pill}</Text>
        </View>
      )}

      <View style={styles.priceRow}>
        <Text style={[styles.priceText, service.price === 'Free' && styles.freeText]}>
          {service.price}
        </Text>

        {!!service.suffix && <Text style={styles.priceSuffix}> {service.suffix}</Text>}
      </View>

      <Text style={styles.priceNote}>{service.note}</Text>

      <TouchableOpacity
        style={[
          styles.selectButton,
          service.buttonColor && { backgroundColor: service.buttonColor },
        ]}
      >
        <Text style={styles.selectButtonText}>{service.button}</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

function Tag({ label, purple }) {
  return (
    <View style={[styles.tag, purple && styles.purpleTag]}>
      <Text style={[styles.tagText, purple && styles.purpleTagText]}>{label}</Text>
    </View>
  );
}

export default function VideoConsultScreen({ navigation }) {
  const [selectedMode, setSelectedMode] = useState('pay-per-use');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredServices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return searchableServicesSeed.filter((service) => {
      const matchesCategory =
        selectedCategory === 'All' || service.category === selectedCategory;

      const matchesSearch =
        normalizedQuery.length === 0 ||
        service.searchText.toLowerCase().includes(normalizedQuery) ||
        service.category.toLowerCase().includes(normalizedQuery) ||
        service.id.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const visibleIds = useMemo(
    () => new Set(filteredServices.map((service) => service.id)),
    [filteredServices]
  );

  const visibleOnlineServices = onlineServices.filter((service) =>
    visibleIds.has(service.title)
  );

  const showPhysicalConsultation = visibleIds.has('Book Physical Consultation');
  const showSpecialistConsultation = visibleIds.has('Book Specialist Consultation');
  const showTherapySession = visibleIds.has('Book Therapy Session');
  const hasResults = filteredServices.length > 0;

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <AppHeader navigation={navigation} />

        <View style={styles.hero}>
          <View style={styles.heroPill}>
            <MaterialCommunityIcons name="medical-bag" size={13} color="#FFFFFF" />
            <Text style={styles.heroPillText}>Healthcare On Demand</Text>
          </View>

          <Text style={styles.heroTitle}>Choose Your Consultation Type</Text>

          <Text style={styles.heroSubtitle}>
            Connect with healthcare professionals anytime, anywhere
          </Text>
        </View>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo: Select User Type</Text>
          <Text style={styles.demoSubtitle}>See how pricing adapts to different user statuses</Text>

          <View style={styles.modeRow}>
            <ModePill
              icon="diamond-outline"
              label="Subscriber"
              active={selectedMode === 'subscriber'}
              activeColor="#F59E0B"
              onPress={() => setSelectedMode('subscriber')}
            />

            <ModePill
              icon="shield-outline"
              label="PhilHealth"
              active={selectedMode === 'philhealth'}
              activeColor="#16A34A"
              onPress={() => setSelectedMode('philhealth')}
            />
          </View>

          <ModePill
            icon="card-outline"
            label="Pay-per-use"
            active={selectedMode === 'pay-per-use'}
            activeColor="#089FB4"
            onPress={() => setSelectedMode('pay-per-use')}
          />
        </View>

        <ServiceSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          resultCount={filteredServices.length}
        />

        {!hasResults && <EmptySearchState onClear={clearSearch} />}

        {visibleOnlineServices.length > 0 && (
          <>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>General Physician</Text>
              <Text style={styles.sectionSubtitle}>Quick access to primary care doctors</Text>
            </View>

            {visibleOnlineServices.map((service) => (
              <ServiceCard key={service.title} service={service} />
            ))}
          </>
        )}

        {showPhysicalConsultation && (
          <>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>In-Person Consultation</Text>
              <Text style={styles.sectionSubtitle}>Book an appointment at our clinics</Text>
            </View>

            <View style={styles.clinicCard}>
              <View style={[styles.serviceIcon, styles.clinicIcon]}>
                <Ionicons name="calendar-outline" size={28} color="#FFFFFF" />
              </View>

              <Text style={styles.serviceTitle}>Book Physical Consultation</Text>

              <Text style={styles.serviceSubtitle}>
                Schedule an in-person visit with our healthcare professionals at convenient locations
                across the metro
              </Text>

              <View style={styles.tagRow}>
                <Tag label="Multiple Locations" />
                <Tag label="Various Specialties" />
                <Tag label="Flexible Scheduling" />
              </View>

              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Schedule Appointment</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {showSpecialistConsultation && (
          <>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Specialist Services</Text>
              <Text style={styles.sectionSubtitle}>Access to specialized medical expertise</Text>
            </View>

            <View style={styles.specialistCard}>
              <View style={styles.specialistTop}>
                <View style={styles.specialistIcon}>
                  <MaterialCommunityIcons name="stethoscope" size={32} color="#8B5CF6" />
                </View>

                <View style={styles.specialistCopy}>
                  <Text style={styles.specialistTitle}>Book Specialist Consultation</Text>
                  <Text style={styles.serviceSubtitle}>Expert care for specialized medical needs</Text>

                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={14} color="#45627F" />
                    <Text style={styles.timeText}>30-45 minutes</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.specialtyLabel}>Available Specialties:</Text>

              <View style={styles.tagRow}>
                {specialtyTags.map((tag) => (
                  <Tag key={tag} label={tag} purple />
                ))}
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.pricePrefix}>From </Text>
                <Text style={styles.priceText}>$75</Text>
              </View>

              <Text style={styles.priceNote}>Varies by specialty</Text>

              <TouchableOpacity style={styles.purpleButton} onPress={() => navigation.navigate('BookSpecialist')}>
                <Text style={styles.selectButtonText}>Book Specialist</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {showTherapySession && (
          <>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Rehabilitation Therapy</Text>
              <Text style={styles.sectionSubtitle}>
                Professional therapy sessions for recovery and wellness
              </Text>
            </View>

            <View style={[styles.clinicCard, styles.therapyCard]}>
              <View style={[styles.serviceIcon, styles.therapyIcon]}>
                <Ionicons name="heart-outline" size={30} color="#FFFFFF" />
              </View>

              <Text style={styles.serviceTitle}>Book Therapy Session</Text>

              <Text style={styles.serviceSubtitle}>
                Professional rehabilitation therapy including physical, occupational, and speech therapy
                services
              </Text>

              <View style={styles.tagRow}>
                {therapyTags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </View>

              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Book Therapy</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.whyCard}>
          <View style={styles.whyCircle} />

          <View style={styles.whySmallPill}>
            <Text style={styles.whySmallText}>Why OkieDoc+</Text>
          </View>

          <Text style={styles.whyTitle}>Quality Healthcare at Your Fingertips</Text>

          <Text style={styles.whySubtitle}>
            Experience seamless healthcare delivery with our comprehensive platform
          </Text>

          {[
            'Board Certified Physicians',
            'Secure & HIPAA Compliant',
            'Prescriptions When Needed',
            'Medical Records Access',
          ].map((item) => (
            <View key={item} style={styles.whyRow}>
              <Ionicons name="checkmark-circle-outline" size={30} color="#FFFFFF" />
              <Text style={styles.whyRowText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.helpBlock}>
          <Text style={styles.helpText}>
            Need help choosing? Our care coordinators are available 24/7
          </Text>

          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="call-outline" size={16} color="#0284A8" />
            <Text style={styles.helpButtonText}>Talk to Care Team</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    backgroundColor: '#F1FAFE',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 14,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#089FB4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  logoTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  logoSubtitle: {
    color: '#64748B',
    fontSize: 10,
  },
  bellIcon: {
    position: 'relative',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 40,
    paddingBottom: 28,
    backgroundColor: '#FAFDFF',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12AFA6',
    borderRadius: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 16,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
  },
  heroTitle: {
    color: '#071C3A',
    fontSize: 40,
    lineHeight: 40,
    fontWeight: '800',
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 14,
  },
  heroSubtitle: {
    color: '#45627F',
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
    maxWidth: 318,
  },
  demoBox: {
    marginHorizontal: 7,
    marginTop: 17,
    marginBottom: 24,
    backgroundColor: '#F0FAFF',
    borderWidth: 1,
    borderColor: '#A6E3F0',
    borderRadius: 11,
    padding: 20,
  },
  demoTitle: {
    color: '#0E2D4D',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 7,
  },
  demoSubtitle: {
    color: '#45627F',
    fontSize: 13,
    marginBottom: 12,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#CBDDE8',
    backgroundColor: '#F8FCFF',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  modePillActive: {
    backgroundColor: '#089FB4',
    borderColor: '#089FB4',
  },
  modeText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 7,
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  searchPanel: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 7,
    marginBottom: 22,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D8EAF1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchLabel: {
    color: '#071C3A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  searchInputWrap: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CFE2EC',
    backgroundColor: '#F8FCFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    paddingVertical: 10,
    marginLeft: 9,
  },
  clearSearchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  categoryScroll: {
    gap: 8,
    paddingTop: 12,
    paddingBottom: 10,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#CBDDE8',
    backgroundColor: '#F8FCFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categoryChipActive: {
    backgroundColor: '#089FB4',
    borderColor: '#089FB4',
  },
  categoryChipText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  searchResultText: {
    color: '#45627F',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyStateCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 7,
    marginBottom: 24,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D8EAF1',
  },
  emptyStateIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyStateTitle: {
    color: '#071C3A',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#45627F',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#089FB4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionIntro: {
    paddingHorizontal: 7,
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#071C3A',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 9,
  },
  sectionSubtitle: {
    color: '#45627F',
    fontSize: 15,
    lineHeight: 22,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 7,
    marginBottom: 20,
    borderRadius: 12,
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 3,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#0799BC',
  },
  cardBadge: {
    position: 'absolute',
    top: -11,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  featuredBadge: {
    backgroundColor: '#089FB4',
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 5,
  },
  serviceIcon: {
    width: 53,
    height: 53,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  serviceTitle: {
    color: '#071C3A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  serviceSubtitle: {
    color: '#45627F',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    color: '#45627F',
    fontSize: 13,
    marginLeft: 7,
  },
  divider: {
    height: 1,
    backgroundColor: '#D8E4EE',
    marginBottom: 14,
  },
  freePill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 14,
  },
  freePillText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  priceText: {
    color: '#071C3A',
    fontSize: 28,
    fontWeight: '800',
  },
  freeText: {
    color: '#10B981',
  },
  priceSuffix: {
    color: '#45627F',
    fontSize: 12,
    marginBottom: 4,
  },
  pricePrefix: {
    color: '#071C3A',
    fontSize: 24,
    marginBottom: 1,
  },
  priceNote: {
    color: '#45627F',
    fontSize: 12,
    marginBottom: 18,
  },
  selectButton: {
    height: 31,
    borderRadius: 7,
    backgroundColor: '#0FAF8F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginRight: 13,
  },
  clinicCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#88DDE2',
    borderRadius: 11,
    marginHorizontal: 7,
    marginBottom: 24,
    padding: 20,
  },
  clinicIcon: {
    backgroundColor: '#0EAAA4',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 26,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90E0E2',
    backgroundColor: '#ECFEFF',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    color: '#02949D',
    fontSize: 11,
    fontWeight: '700',
  },
  purpleTag: {
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
  },
  purpleTagText: {
    color: '#7C3AED',
  },
  specialistCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 7,
    marginBottom: 24,
    borderRadius: 12,
    padding: 27,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 3,
  },
  specialistTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  specialistIcon: {
    width: 66,
    height: 66,
    borderRadius: 12,
    backgroundColor: '#F4EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  specialistCopy: {
    flex: 1,
  },
  specialistTitle: {
    color: '#071C3A',
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    marginBottom: 12,
  },
  specialtyLabel: {
    color: '#071C3A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  purpleButton: {
    height: 33,
    borderRadius: 7,
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  therapyCard: {
    borderColor: '#A8E8E4',
  },
  therapyIcon: {
    backgroundColor: '#0EAAA4',
  },
  whyCard: {
    backgroundColor: '#0FAEAF',
    borderRadius: 11,
    marginHorizontal: 7,
    marginTop: 20,
    marginBottom: 64,
    paddingHorizontal: 27,
    paddingTop: 29,
    paddingBottom: 21,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  whyCircle: {
    position: 'absolute',
    right: -42,
    top: -54,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  whySmallPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 18,
  },
  whySmallText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  whyTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    marginBottom: 14,
  },
  whySubtitle: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 23,
  },
  whyRow: {
    height: 46,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  whyRowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 12,
  },
  helpBlock: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 8,
  },
  helpText: {
    color: '#45627F',
    fontSize: 18,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -20,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0284A8',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  helpButtonText: {
    color: '#0284A8',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 10,
  },
});