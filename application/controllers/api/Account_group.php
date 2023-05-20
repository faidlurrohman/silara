<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Account_group extends REST_Controller {

    function __construct()
    {
        parent::__construct();
        $this->_authenticate_CORS();
        $this->load->model('Account_group_model');
    }

    public function data_get()
    {
        $this->do_get_all();
    }

    private function do_get_all()
    {   
        $data = $this->Account_group_model->get_all();
     
        if ($data['r_code'] != 0) {
            $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        } else {
            $this->response($data, REST_Controller::HTTP_OK);
        }
    }

    public function list_get()
    {
        $this->do_get_list();
    }

    private function do_get_list()
    {   
        $data = $this->Account_group_model->get_list();
     
        if ($data['r_code'] != 0) {
            $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        } else {
            $this->response($data, REST_Controller::HTTP_OK);
        }
    }

    public function add_post()
    {
        $this->do_create();
    }

    private function do_create()
    {
        $data = $this->Account_group_model->save($this->input_fields());

        if ($data['r_code'] != 0) {
            $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        } else {
            $this->response($data, REST_Controller::HTTP_OK);
        }
    }

    public function remove_delete($id)
    {
        return $this->do_delete($id);
    }

    private function do_delete($id)
    {
        if ($id <= 0) {
            $this->response(['status' => '400'], REST_Controller::HTTP_BAD_REQUEST);
        }

        $data = $this->Account_group_model->delete(array('id' => $id));

        if ($data['r_code'] != 0) {
            $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
        } else {
            $this->response($data, REST_Controller::HTTP_OK);
        }
    }

    private function input_fields($is_edit = 0)
    {
        return array(
            'id' => $this->post_or_put('id', $is_edit),
            'account_base_id' => $this->post_or_put('account_base_id', $is_edit),
            'label' => $this->post_or_put('label', $is_edit),
            'remark' => $this->post_or_put('remark', $is_edit),
            'active' => $this->post_or_put('active', $is_edit),
        );
    }

    private function post_or_put($field, $is_edit = 0)
    {
        return ($is_edit == 0) ? $this->post($field) : $this->put($field);
    }

    protected function _authenticate_CORS()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: ACCEPT, ORIGIN, X-REQUESTED-WITH, CONTENT-TYPE, AUTHORIZATION, Client-ID, Secret-Key, Authorization, User-ID');
        if ("OPTIONS" === $_SERVER['REQUEST_METHOD']) {
            die();
        }
    }

}
