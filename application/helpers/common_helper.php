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
        $data['code'] = $e['code'];
        $data['err_msg'] = $e['message'];
    }
    
    return $data;
}

function res_type($type, $query)
{
    switch ($type) {
        // get data     
        case 0:
            $data['code'] = 0;
            $data['data'] = $query->result_array();
            break;
        // get list
        case 1:
            $data = $query->result_array();
            break;
        // save / update / delete
        case 2:
            $data['id'] = $query->row_array()['__new_id'];
            $data['code'] = $query->row_array()['__code'] ? $query->row_array()['__code'] : 0;
            $data['message'] = err_msg($query);
            break;
        // delete
        case 3:
            $data['r_code'] = 0;
            $data['data'] = $query->row_array();
            break;
        // feature menu
        case 4:
            $data['r_code'] = 0;
            $data['data'] = $query;
            // $this->db->query($sql)->row()->menu;
            break;
        // auth
        case 10:
            $data['data'] = $query->row_array();
            $data['code'] = $data['data']['token'] ? 0 : ( $data['data']['__res_data'] == 1 ? 0 : 1 );
            $data['message'] = $data['data']['token'] ? '' : ( $data['data']['__res_data'] == 1 ? '' : 'Nama pengguna atau kata sandi salah' );
            break;
    }

    return $data;
}

function err_msg($query, $message = ''){
    $code = $query->row_array()['__code'];

    switch ($code) {
        // data tidak ada
        case 101:
            $message = 'Data tidak di temukan';
            break;
        // data duplicate
        case 102:
            $message = 'Data sudah ada';
            break;
        // mode salah atau di luar salah satu C/U/D
        case 103:
            $message = 'Data yang di kirim tidak sesuai';
            break;
        // schema tidak ada
        case 104:
            $message = 'Data yang di kirim tidak sesuai';
            break;
        // user tidak ada
        case 105:
            $message = 'Pengguna tidak terdaftar untuk melakukan perubahan data';
            break;
        // format parameter salah
        case 106:
            $message = 'Data yang di kirim tidak sesuai';
            break;
    }

    return $message;
}