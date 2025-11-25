import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type AlertType = 'success' | 'warning' | 'error';

interface AlertBoxProps {
  visible: boolean;
  type?: AlertType;
  title?: string;
  message?: string;
  onClose: () => void;
}

const VARIANT: Record<AlertType, { color: string; bg: string; icon: string }> = {
  success: { color: '#28a745', bg: '#e9fce2', icon: '✅' },
  warning: { color: '#ffc107', bg: '#fffbe6', icon: '⚠️' },
  error:   { color: '#dc3545', bg: '#fee6e7', icon: '❌' }
};

const AlertBox: React.FC<AlertBoxProps> = ({
  visible,
  type = 'success',
  title = '',
  message = '',
  onClose
}) => {
  const style = VARIANT[type];
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.alert, { backgroundColor: style.bg, borderLeftColor: style.color }]}>
          <Text style={[styles.icon, { color: style.color }]}>{style.icon}</Text>
          {title ? <Text style={[styles.title, { color: style.color }]}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: style.color }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  alert: {
    minWidth: '72%',
    minHeight: 170,
    borderRadius: 15,
    padding: 24,
    borderLeftWidth: 7,
    shadowColor: '#444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 7,
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
    marginBottom: 10,
  },
  title: {
    fontSize: 21,
    fontWeight: '600',
    marginBottom: 7,
    textAlign: "center"
  },
  message: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center"
  },
  button: {
    marginTop: 10,
    minWidth: 90,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center'
  }
});

export default AlertBox;