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
import ScheduledActivityCard from "../ScheduleActivityCard";

const ActivityList = ({
                          activities,
                          onDragEnd,
                          toggleActivityDone,
                          handleDeleteActivity,
                          getImageForActivity,
                          onLongPress,
                      }) => {
    const renderItem = ({ item, drag, isActive }) => {
        const scale = new Animated.Value(1);

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
                    ]}
                >
                    <TouchableOpacity
                        onLongPress={() => onLongPress(item)}
                        onPressIn={() => {
                            onPressIn();
                        }}
                        onPressOut={() => {
                            onPressOut();
                        }}
                        onPress={() => {}}
                        delayLongPress={200}
                    >
                        <ScheduledActivityCard
                            activity={item}
                            imageSource={getImageForActivity(item, item.category)}
                        />
                    </TouchableOpacity>
                </Animated.View>
            </Swipeable>
        );
    };

    return (
        <DraggableFlatList
            data={activities}
            keyExtractor={(item) => item._id ? item._id.toString() : item.name}
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
});

export default ActivityList;
