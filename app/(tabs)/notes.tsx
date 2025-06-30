import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function NotesScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useAppSettings();
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Animasi transisi
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  // Fungsi untuk menjalankan animasi
  const runAnimations = () => {
    // Reset animasi
    contentOpacity.value = 0;
    contentTranslateY.value = 50;

    // Animasi content dengan delay
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    contentTranslateY.value = withDelay(200, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
  };

  // Jalankan animasi setiap kali screen mendapat focus
  useFocusEffect(
    React.useCallback(() => {
      runAnimations();
    }, [])
  );

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const addNote = () => {
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([newNote, ...notes]);
      setNewNoteTitle('');
      setNewNoteContent('');
      setIsAddingNote(false);
    }
  };

  const updateNote = () => {
    if (editingNote && newNoteTitle.trim() && newNoteContent.trim()) {
      const updatedNotes = notes.map(note =>
        note.id === editingNote.id
          ? {
            ...note,
            title: newNoteTitle.trim(),
            content: newNoteContent.trim(),
            updatedAt: new Date(),
          }
          : note
      );
      setNotes(updatedNotes);
      setEditingNote(null);
      setNewNoteTitle('');
      setNewNoteContent('');
    }
  };

  const deleteNote = (noteId: string) => {
    Alert.alert(
      t('Delete Note'),
      t('Are you sure you want to delete this note?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: () => {
            setNotes(notes.filter(note => note.id !== noteId));
            if (editingNote?.id === noteId) {
              setEditingNote(null);
              setNewNoteTitle('');
              setNewNoteContent('');
            }
          },
        },
      ]
    );
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>{t('Notes')}</Text>
        <TouchableOpacity
          style={[styles.addButton, isDarkMode && styles.addButtonDark]}
          onPress={() => setIsAddingNote(true)}
        >
          <Plus size={20} color={isDarkMode ? '#fff' : '#6366f1'} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, contentAnimatedStyle]}
        showsVerticalScrollIndicator={false}
      >
        {/* Add/Edit Note Form */}
        {(isAddingNote || editingNote) && (
          <View style={[styles.noteForm, isDarkMode && styles.noteFormDark]}>
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, isDarkMode && styles.formTitleDark]}>
                {editingNote ? t('Edit Note') : t('Add Note')}
              </Text>
              <TouchableOpacity onPress={cancelEditing}>
                <X size={20} color={isDarkMode ? '#fff' : '#6366f1'} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.titleInput, isDarkMode && styles.titleInputDark]}
              placeholder={t('Note title')}
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
            />

            <TextInput
              style={[styles.contentInput, isDarkMode && styles.contentInputDark]}
              placeholder={t('Note content')}
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.saveButton, isDarkMode && styles.saveButtonDark]}
              onPress={editingNote ? updateNote : addNote}
            >
              <Save size={16} color="#fff" />
              <Text style={styles.saveButtonText}>{t('Save')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notes List */}
        {notes.length === 0 && !isAddingNote && !editingNote ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
              {t('No notes yet. Tap the + button to add your first note!')}
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <View
              key={note.id}
              style={[styles.noteCard, isDarkMode && styles.noteCardDark]}
            >
              <View style={styles.noteHeader}>
                <Text style={[styles.noteTitle, isDarkMode && styles.noteTitleDark]}>
                  {note.title}
                </Text>
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, isDarkMode && styles.actionButtonDark]}
                    onPress={() => startEditing(note)}
                  >
                    <Edit3 size={16} color={isDarkMode ? '#9ca3af' : '#6366f1'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, isDarkMode && styles.actionButtonDark]}
                    onPress={() => deleteNote(note.id)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.noteContent, isDarkMode && styles.noteContentDark]}>
                {note.content}
              </Text>

              <Text style={[styles.noteDate, isDarkMode && styles.noteDateDark]}>
                {formatDate(note.updatedAt)}
              </Text>
            </View>
          ))
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#18181b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
  },
  headerDark: {
    borderBottomColor: '#27272a',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
  },
  titleDark: {
    color: '#f1f5f9',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDark: {
    backgroundColor: '#27272a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  noteForm: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  noteFormDark: {
    backgroundColor: '#23272f',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
  },
  formTitleDark: {
    color: '#f1f5f9',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#1e293b',
    marginBottom: 12,
  },
  titleInputDark: {
    borderColor: '#374151',
    backgroundColor: '#27272a',
    color: '#f1f5f9',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1e293b',
    height: 100,
    marginBottom: 16,
  },
  contentInputDark: {
    borderColor: '#374151',
    backgroundColor: '#27272a',
    color: '#f1f5f9',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
  },
  saveButtonDark: {
    backgroundColor: '#6366f1',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyTextDark: {
    color: '#9ca3af',
  },
  noteCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  noteCardDark: {
    backgroundColor: '#23272f',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
  },
  noteTitleDark: {
    color: '#f1f5f9',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDark: {
    backgroundColor: '#374151',
  },
  noteContent: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteContentDark: {
    color: '#9ca3af',
  },
  noteDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#94a3b8',
  },
  noteDateDark: {
    color: '#6b7280',
  },
}); 