<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

function get_token() 
{
    $CI = &get_instance();
    $auth = $CI->input->get_request_header('Authorization');
    $token = explode("Bearer ", $auth)[1];

    return isset($token) ? $token : '';
}

function model_response($query, $type = 0)
{
    $CI = &get_instance();
    $e = $CI->db->error();

    if ($e['code'] == '00000') {
        return res_type($type, $query);
    } else {
        return err_db($e);
    }
}

function res_type($type, $query)
{
    $row = $query->row_array();
    $arr = $query->result_array();

    switch ($type) {
        // get data     
        case 0:
            $data['code'] = isset($row['__code']) ? $row['__code'] : 0; 
            $data['data'] = isset($row['__code']) ? array() : ($row['__code'] > 0 ? array() : $arr);
            $data['message'] = err_msg($query);
            break;
        // get list
        case 1:
            $data['data'] = isset($row['__code']) ? array() : ($row['__res_count'] == 0 ? array() : $arr);
            $data['code'] = isset($row['__code']) ? $row['__code'] : 0;
            $data['message'] = err_msg($query);
            break;
        // save / update / delete
        case 2:
            $data['id'] = $row['__new_id'];
            $data['code'] = $row['__code'] ? $row['__code'] : 0;
            $data['message'] = err_msg($query);
            break;
        // delete
        case 3:
            $data['code'] = 0;
            $data['data'] = $row;
            break;
        // single row
        case 4:
            $data = $row;
            break;
        // auth
        case 10:
            $data['data'] = $row;
            $data['code'] = $row['token'] ? 0 : ($row['__res_data'] == 1 ? 0 : 1 );
            $data['message'] = $row['token'] ? '' : ($row['__res_data'] == 1 ? '' : 'Nama pengguna atau kata sandi salah' );
            break;
    }

    return $data;
}

function err_msg($query, $message = ''){
    $code = $query->row_array()['__code'];

    switch ($code) {
        // data tidak ada
        case 101:
            $message = 'Data tidak ditemukan';
            break;
        // data duplicate
        case 102:
            $message = 'Data sudah ada';
            break;
        // mode salah atau di luar salah satu C/U/D
        case 103:
            $message = 'Data yang dikirim tidak sesuai';
            break;
        // schema tidak ada
        case 104:
            $message = 'Data yang dikirim tidak sesuai';
            break;
        // user tidak ada
        case 105:
            $message = 'Pengguna tidak terdaftar untuk melakukan perubahan data';
            break;
        // format parameter salah
        case 106:
            $message = 'Data yang dikirim tidak sesuai';
            break;
        // data alokasi kota tidak bisa dirubah
        case 110:
            $message = 'Alokasi tidak bisa diubah, karena sudah terdapat transaksi';
            break;
    }

    return $message;
}

function err_db($error){
    $code = $error['code'];

    switch ($code) {
        // POSTGRES ERROR CODE https://www.postgresql.org/docs/current/errcodes-appendix.html
        // data duplicate
        case str_contains($code, '23505/7'):
            $code = 102;
            $message = 'Data sudah ada';
            break;

        default : 
            $message = 'Error Postgres Code : '. $code;
    }

    return ['code' =>  $code, 'message' => $message];
}

function set_order($value){
    return str_replace('%20',' ',$value);
}