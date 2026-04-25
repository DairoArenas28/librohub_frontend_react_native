import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppConfig, AppConfig } from '../../context/AppConfigContext';

const APP_VERSION = '1.0.0';

// Opciones de tiempo de inactividad
const INACTIVITY_OPTIONS = [
  { label: 'Desactivado', value: 0 },
  { label: '5 minutos', value: 5 },
  { label: '10 minutos', value: 10 },
  { label: '15 minutos', value: 15 },
  { label: '30 minutos', value: 30 },
  { label: '60 minutos', value: 60 },
];

// Opciones de aviso antes del logout
const WARNING_OPTIONS = [
  { label: '30 segundos', value: 30 },
  { label: '60 segundos', value: 60 },
  { label: '2 minutos', value: 120 },
];

// Opciones de sincronización del catálogo
const POLLING_OPTIONS = [
  { label: 'Desactivado', value: 0 },
  { label: '15 seg', value: 15 },
  { label: '30 seg', value: 30 },
  { label: '1 min', value: 60 },
  { label: '5 min', value: 300 },
];

// Opciones de tamaño de portada
const COVER_SIZE_OPTIONS = [
  { label: '2 MB', value: 2 },
  { label: '5 MB', value: 5 },
  { label: '10 MB', value: 10 },
];

// Opciones de tamaño de PDF
const PDF_SIZE_OPTIONS = [
  { label: '10 MB', value: 10 },
  { label: '25 MB', value: 25 },
  { label: '50 MB', value: 50 },
];

export default function SettingsScreen(): React.JSX.Element {
  const { config, updateConfig, resetConfig } = useAppConfig();
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (partial: Partial<AppConfig>) => {
    setSaving(true);
    await updateConfig(partial);
    setSaving(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Restablecer configuración',
      '¿Estás seguro de que deseas restablecer todos los ajustes a los valores predeterminados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            await resetConfig();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Configuración</Text>

      {/* ── SESIÓN ─────────────────────────────────── */}
      <SectionHeader title="Sesión" icon="🔐" />

      <SettingCard>
        <Text style={styles.settingLabel}>Tiempo de inactividad</Text>
        <Text style={styles.settingDescription}>
          Cierra la sesión automáticamente si el usuario no interactúa con la app.
        </Text>
        <OptionRow
          options={INACTIVITY_OPTIONS}
          selected={config.inactivityTimeoutMinutes}
          onSelect={(v) => handleUpdate({ inactivityTimeoutMinutes: v })}
        />
      </SettingCard>

      {config.inactivityTimeoutMinutes > 0 && (
        <SettingCard>
          <Text style={styles.settingLabel}>Aviso antes del cierre</Text>
          <Text style={styles.settingDescription}>
            Tiempo que tiene el usuario para responder antes del logout automático.
          </Text>
          <OptionRow
            options={WARNING_OPTIONS}
            selected={config.warningTimeoutSeconds}
            onSelect={(v) => handleUpdate({ warningTimeoutSeconds: v })}
          />
        </SettingCard>
      )}

      {/* ── ARCHIVOS ───────────────────────────────── */}
      <SectionHeader title="Archivos" icon="📁" />

      <SettingCard>
        <Text style={styles.settingLabel}>Tamaño máximo de portada</Text>
        <Text style={styles.settingDescription}>
          Límite para imágenes PNG/JPG al subir la portada de un libro.
        </Text>
        <OptionRow
          options={COVER_SIZE_OPTIONS}
          selected={config.maxCoverSizeMB}
          onSelect={(v) => handleUpdate({ maxCoverSizeMB: v })}
        />
      </SettingCard>

      <SettingCard>
        <Text style={styles.settingLabel}>Tamaño máximo de PDF</Text>
        <Text style={styles.settingDescription}>
          Límite para archivos PDF al subir el contenido de un libro.
        </Text>
        <OptionRow
          options={PDF_SIZE_OPTIONS}
          selected={config.maxPdfSizeMB}
          onSelect={(v) => handleUpdate({ maxPdfSizeMB: v })}
        />
      </SettingCard>

      {/* ── CATÁLOGO ───────────────────────────────── */}
      <SectionHeader title="Catálogo" icon="📚" />

      <SettingCard>
        <Text style={styles.settingLabel}>Sincronización automática</Text>
        <Text style={styles.settingDescription}>
          Intervalo con el que el catálogo del lector se actualiza en segundo plano. Un spinner discreto aparece en el header durante la sincronización.
        </Text>
        <OptionRow
          options={POLLING_OPTIONS}
          selected={config.catalogPollingSeconds}
          onSelect={(v) => handleUpdate({ catalogPollingSeconds: v })}
        />
      </SettingCard>

      <SettingCard>
        <ToggleRow
          label="Mostrar libros 'Próximamente'"
          description="Los lectores verán los libros marcados como próximamente en el catálogo."
          value={config.showComingSoonBooks}
          onToggle={(v) => handleUpdate({ showComingSoonBooks: v })}
        />
      </SettingCard>

      {/* ── USUARIOS ───────────────────────────────── */}
      <SectionHeader title="Usuarios" icon="👥" />

      <SettingCard>
        <ToggleRow
          label="Permitir registro público"
          description="Los usuarios pueden crear su propia cuenta desde la pantalla de inicio de sesión."
          value={config.allowPublicRegistration}
          onToggle={(v) => handleUpdate({ allowPublicRegistration: v })}
        />
      </SettingCard>

      {/* ── RESTABLECER ────────────────────────────── */}
      <SectionHeader title="Avanzado" icon="⚙️" />

      <SettingCard>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel="Restablecer configuración"
        >
          <Text style={styles.resetButtonText}>Restablecer valores predeterminados</Text>
        </TouchableOpacity>
      </SettingCard>

      {/* ── INFO ───────────────────────────────────── */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>LibroHub v{APP_VERSION}</Text>
        {saving && <Text style={styles.savingText}>Guardando...</Text>}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function SettingCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function OptionRow({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: number }[];
  selected: number;
  onSelect: (v: number) => void;
}) {
  return (
    <View style={styles.optionRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.optionChip, selected === opt.value && styles.optionChipActive]}
          onPress={() => onSelect(opt.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: selected === opt.value }}
        >
          <Text style={[styles.optionChipText, selected === opt.value && styles.optionChipTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#ddd', true: '#4A90E2' }}
        thumbColor={value ? '#fff' : '#fff'}
      />
    </View>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 20, marginTop: 8 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8 },
  sectionIcon: { fontSize: 18, marginRight: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.8 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  settingLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  settingDescription: { fontSize: 13, color: '#888', marginBottom: 12, lineHeight: 18 },

  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  optionChipActive: { borderColor: '#4A90E2', backgroundColor: '#EBF4FF' },
  optionChipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  optionChipTextActive: { color: '#4A90E2', fontWeight: '700' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleText: { flex: 1, marginRight: 12 },

  resetButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e53e3e',
  },
  resetButtonText: { color: '#e53e3e', fontSize: 15, fontWeight: '600' },

  versionContainer: { alignItems: 'center', marginTop: 24, gap: 4 },
  versionText: { fontSize: 13, color: '#bbb' },
  savingText: { fontSize: 12, color: '#4A90E2' },
});
