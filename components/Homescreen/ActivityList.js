// ActivityList.js
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Image,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import ScheduledActivityCard from '../ScheduleActivityCard';
import { isAttractionAvailable } from '../utils/attractionAvailability';

const ActivityList = ({
                          activities,
                          onDragEnd,
                          toggleActivityDone,
                          handleDeleteActivity,
                          getImageForActivity,
                          onLongPress,
                          currentDate, // Ajout de currentDate dans les props
                      }) => {
    const renderItem = ({ item, drag, isActive }) => {
        const scale = new Animated.Value(1);
        const isAvailable = isAttractionAvailable(item, [currentDate]); // Vérification de la disponibilité

        const onPressIn = () => {
            Animated.spring(scale, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const onPressOut = () => {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        const renderRightActions = () => (
            <View style={styles.rightActionContainer}>
                <TouchableOpacity
                    style={styles.doneButtonContainer}
                    onPress={() => toggleActivityDone(item)}
                >
                    <Text style={styles.doneButtonText}>
                        {item.done ? 'Non fait' : 'Fait'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButtonContainer}
                    onPress={() => handleDeleteActivity(item)}
                >
                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                </TouchableOpacity>
            </View>
        );

        return (
            <Swipeable renderRightActions={renderRightActions}>
                <Animated.View
                    style={[
                        styles.cardWrapper,
                        {
                            transform: [{ scale }],
                        },
                        item.done && styles.doneActivity,
                        !isAvailable && styles.unavailableActivity, // Style pour l'attraction indisponible
                    ]}
                >
                    <TouchableOpacity
                        onLongPress={() => onLongPress(item)}
                        onPressIn={onPressIn}
                        onPressOut={onPressOut}
                        onPress={() => {}}
                        delayLongPress={200}
                    >
                        <ScheduledActivityCard
                            activity={item}
                            imageSource={getImageForActivity(item, item.category)}
                        />
                        {!isAvailable && (
                            <View style={styles.unavailableOverlay}>
                                <Text style={styles.unavailableText}>En réhabilitation</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </Swipeable>
        );
    };

    return (
        <DraggableFlatList
            data={activities}
            keyExtractor={(item) => (item._id ? item._id.toString() : item.name)}
            renderItem={renderItem}
            onDragEnd={onDragEnd}
            activationDistance={20}
            dragItemOverflow={false}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 50 }}
        />
    );
};

const styles = StyleSheet.create({
    cardWrapper: {
        backgroundColor: '#fff',
        marginVertical: 5,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    rightActionContainer: {
        flexDirection: 'row',
        width: 160,
    },
    doneButtonContainer: {
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    doneButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    deleteButtonContainer: {
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    doneActivity: {
        opacity: 0.5,
    },
    unavailableActivity: {
        backgroundColor: '#FADBD8',
    },
    unavailableOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unavailableText: {
        color: '#E74C3C',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ActivityList;
