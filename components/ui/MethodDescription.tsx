import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  headerText: string;
  bodyText: string;
};

export default function MethodDescription({ headerText, bodyText }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{headerText}</Text>
      <View style={styles.box}>
        <Text style={styles.body}>{bodyText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',    
    alignItems: 'center',      
    gap: 8,
    alignSelf: 'stretch',
  },
  header: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30, 
    alignSelf: 'flex-start', 
  },
  box: {
    display: 'flex',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    borderRadius: 8,
    backgroundColor: '#F5F5F5', 
    width: 326,
  },
  body: {
    color: '#555555',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24, 
  },
});
