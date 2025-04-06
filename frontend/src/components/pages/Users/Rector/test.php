<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $doctor_id = $_POST['doctor_id'];
    $slot_time = $_POST['slot_time'];
    $status = $_POST['status']; 
    
    // Check if slot exists
    $check_stmt = $conn->prepare("SELECT schedule_id FROM schedules 
                                 WHERE doctor_id = ? AND slot_time = ?");
    $check_stmt->bind_param("is", $doctor_id, $slot_time);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        $row = $check_result->fetch_assoc();
        $update_stmt = $conn->prepare("UPDATE schedules SET status = ? 
                                      WHERE schedule_id = ?");
        $update_stmt->bind_param("si", $status, $row['schedule_id']);
        $update_stmt->execute();
        $update_stmt->close();
    } else {
        // Create new slot
        $insert_stmt = $conn->prepare("INSERT INTO schedules (doctor_id, slot_time, status) 
                                      VALUES (?, ?, ?)");
        $insert_stmt->bind_param("iss", $doctor_id, $slot_time, $status);
        $insert_stmt->execute();
        $insert_stmt->close();
    }
    
    $check_stmt->close();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Availability updated successfully'
    ]);
}

$conn->close();
?>