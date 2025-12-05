<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit();
}

// Логирование данных в файл для отладки
$logFile = __DIR__ . '/leads.log';
$logEntry = date('Y-m-d H:i:s') . ' | ' . json_encode($data, JSON_UNESCAPED_UNICODE) . PHP_EOL;
file_put_contents($logFile, $logEntry, FILE_APPEND);

// TODO: Здесь добавьте интеграцию с Bitrix24
// Пример:
// $webhook = 'YOUR_BITRIX24_WEBHOOK_URL';
// $result = file_get_contents($webhook, false, stream_context_create([
//     'http' => [
//         'method' => 'POST',
//         'header' => 'Content-Type: application/json',
//         'content' => json_encode([
//             'fields' => [
//                 'TITLE' => $data['name'] ?? 'Заявка с сайта',
//                 'NAME' => $data['name'] ?? '',
//                 'PHONE' => [['VALUE' => $data['phone'] ?? '', 'VALUE_TYPE' => 'WORK']],
//                 'EMAIL' => [['VALUE' => $data['email'] ?? '', 'VALUE_TYPE' => 'WORK']],
//                 'COMMENTS' => $data['comment'] ?? ''
//             ]
//         ])
//     ]
// ]));

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Заявка получена',
    'data' => $data
]);
