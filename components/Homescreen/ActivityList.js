// ActivityList.js
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import ScheduledActivityCard from "../ScheduleActivityCard";

const ActivityList = ({
                          activities,
                          currentDate,
                          onDragEnd,
                          toggleActivityDone,
                          handleDeleteActivity,
                          getImageForActivity,
                          onLongPress, // Ajoutez onLongPress ici
                      }) => {
    const getSortedActivities = () => {
        const dayActivities = activities[currentDate?.toDateString()] || [];
        const notDoneActivities = dayActivities.filter(activity => !activity.done);
        const doneActivities = dayActivities.filter(activity => activity.done);
        return [...notDoneActivities, ...doneActivities];
    };

    const renderItem = ({ item, drag, isActive }) => {
        const renderRightActions = () => (
            <View style={styles.rightActionContainer}>
                <TouchableOpacity
                    style={styles.doneButtonContainer}
                    onPress={() => toggleActivityDone(item)}
                >
                    <Text style={styles.doneButtonText}>{item.done ? 'Non fait' : 'Fait'}</Text>
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
                <TouchableOpacity
                    onLongPress={() => onLongPress(item)} // Utilisez onLongPress ici
                    onPressIn={drag} // Utilisez onPressIn pour démarrer le drag
                    disabled={isActive}
                    style={[
                        styles.cardWrapper,
                        isActive && { backgroundColor: '#f0f0f0' },
                        item.done && styles.doneActivity,
                    ]}
                >
                    <ScheduledActivityCard activity={item} imageSource={getImageForActivity(item, item.category)} />
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <FlatList
            data={activities}
            keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
            renderItem={renderItem}
            onDragEnd={onDragEnd}
            activationDistance={5}
            dragItemOverflow={false}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 50 }}
        />
    );
};

const styles = StyleSheet.create({
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
});

export default ActivityList;
