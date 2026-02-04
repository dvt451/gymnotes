import React from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from './ExersicesStyles';

export default function AddExerciseModal({ visible, onClose, newExerciseName, setNewExerciseName, onSave }) {
	return (
		<Modal visible={visible} transparent animationType="slide">
			<Pressable style={styles.modalOverlay} onPress={onClose}>
				<Pressable style={styles.modalContent} onPress={() => { }}>
					<Text style={styles.modalTitle}>Новое упражнение</Text>
					<TextInput
						style={styles.input}
						placeholder="Название упражнения"
						value={newExerciseName}
						onChangeText={setNewExerciseName}
					/>
					<TouchableOpacity style={styles.saveBtn} onPress={onSave}>
						<Text style={styles.saveBtnText}>Сохранить</Text>
					</TouchableOpacity>
				</Pressable>
			</Pressable>
		</Modal>
	);
}
