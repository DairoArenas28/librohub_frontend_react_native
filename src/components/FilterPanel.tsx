import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { BookFilters } from '../types/book';

/**
 * Panel de filtros para el catálogo de libros.
 * Permite filtrar por Categoría y Año de publicación.
 * Requisitos: 6.1, 6.5
 */

export interface FilterPanelProps {
  categories: string[];
  years: number[];
  selectedCategory: string | null;
  selectedYear: number | null;
  onApply: (filters: BookFilters) => void;
  onClear: () => void;
  visible: boolean;
}

type DropdownType = 'category' | 'year' | null;

export default function FilterPanel({
  categories,
  years,
  selectedCategory,
  selectedYear,
  onApply,
  onClear,
  visible,
}: FilterPanelProps): React.JSX.Element | null {
  const [localCategory, setLocalCategory] = useState<string | null>(selectedCategory);
  const [localYear, setLocalYear] = useState<number | null>(selectedYear);
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  if (!visible) return null;

  const handleApply = () => {
    const filters: BookFilters = {};
    if (localCategory !== null) filters.category = localCategory;
    if (localYear !== null) filters.year = localYear;
    onApply(filters);
  };

  const handleClear = () => {
    setLocalCategory(null);
    setLocalYear(null);
    onClear();
  };

  const toggleDropdown = (type: DropdownType) => {
    setOpenDropdown(prev => (prev === type ? null : type));
  };

  return (
    <View style={styles.container} testID="filter-panel">
      {/* Dropdown Categoría */}
      <View style={styles.dropdownWrapper}>
        <Text style={styles.label}>Categoría</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => toggleDropdown('category')}
          accessibilityRole="button"
          accessibilityLabel="Seleccionar categoría"
          testID="category-dropdown"
        >
          <Text style={styles.dropdownButtonText}>
            {localCategory ?? 'Todas las categorías'}
          </Text>
          <Text style={styles.chevron}>{openDropdown === 'category' ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {openDropdown === 'category' && (
          <View style={styles.dropdownList} testID="category-list">
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setLocalCategory(null);
                setOpenDropdown(null);
              }}
            >
              <Text style={styles.dropdownItemText}>Todas las categorías</Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.dropdownItem,
                  localCategory === cat && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  setLocalCategory(cat);
                  setOpenDropdown(null);
                }}
                testID={`category-option-${cat}`}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    localCategory === cat && styles.dropdownItemTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Dropdown Año */}
      <View style={styles.dropdownWrapper}>
        <Text style={styles.label}>Año</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => toggleDropdown('year')}
          accessibilityRole="button"
          accessibilityLabel="Seleccionar año"
          testID="year-dropdown"
        >
          <Text style={styles.dropdownButtonText}>
            {localYear !== null ? String(localYear) : 'Todos los años'}
          </Text>
          <Text style={styles.chevron}>{openDropdown === 'year' ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {openDropdown === 'year' && (
          <View style={styles.dropdownList} testID="year-list">
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setLocalYear(null);
                setOpenDropdown(null);
              }}
            >
              <Text style={styles.dropdownItemText}>Todos los años</Text>
            </TouchableOpacity>
            {years.map(yr => (
              <TouchableOpacity
                key={yr}
                style={[
                  styles.dropdownItem,
                  localYear === yr && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  setLocalYear(yr);
                  setOpenDropdown(null);
                }}
                testID={`year-option-${yr}`}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    localYear === yr && styles.dropdownItemTextSelected,
                  ]}
                >
                  {String(yr)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Limpiar filtros"
          testID="clear-button"
        >
          <Text style={styles.clearButtonText}>Limpiar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApply}
          accessibilityRole="button"
          accessibilityLabel="Aplicar filtros"
          testID="apply-button"
        >
          <Text style={styles.applyButtonText}>FILTRAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownWrapper: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginTop: 2,
    maxHeight: 180,
    overflow: 'scroll',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#e8f0fe',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  applyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#1a73e8',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
