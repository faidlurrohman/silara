<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Transaction extends REST_Controller {

    function __construct()
    {
        parent::__construct();
        $this->_authenticate_CORS();
        $this->_authenticate_BEARER();
        $this->load->model('Auth_model');
        $this->load->model('Transaction_model');
    }

    public function data_get()
    {
        $this->do_get_all();
    }

    private function do_get_all()
    {   
        $user = $this->Auth_model->check_token();

        if ($user) {
            $limit = !empty($this->get('limit')) ? $this->get('limit') : 0; 
            $offset = !empty($this->get('offset')) ? $this->get('offset') : 0; 
            $order = !empty($this->get('order')) ? $this->get('order') : 'id desc'; 
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $data = $this->Transaction_model->get_all($user, $limit, $offset, $order, $filter);
        
            if ($data['code'] != 0) {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            } else {
                $this->response($data, REST_Controller::HTTP_OK);
            }
        } else {
            $this->response(['status'=> "Unauthorized"], REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function last_transaction_get()
    {
        $this->do_get_last_transaction();
    }

    private function do_get_last_transaction()
    {   
        $user = $this->Auth_model->check_token();

        if($user){
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $data = $this->Transaction_model->get_last_transaction($user, $filter);
        
            if ($data['code'] != 0) {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            } else {
                $this->response($data, REST_Controller::HTTP_OK);
            }
        } else {
            $this->response(['status'=> "Unauthorized"], REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function object_list_get()
    {
        $this->do_get_list_object();
    }

    private function do_get_list_object()
    {   
        $user = $this->Auth_model->check_token();

        if($user){
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $data = $this->Transaction_model->get_object_list($user, $filter);
        
            if ($data['code'] != 0) {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            } else {
                $this->response($data, REST_Controller::HTTP_OK);
            }
        } else {
            $this->response(['status'=> "Unauthorized"], REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function add_post()
    {
        $this->do_create();
    }

    private function do_create()
    {
        $user = $this->Auth_model->check_token();

        if ($user) {
            $data = $this->Transaction_model->save($user, $this->input_fields());

            if ($data['code'] != 0) {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            } else {
                $this->response($data, REST_Controller::HTTP_OK);
            }
        } else {
            $this->response(['status'=> "Unauthorized"], REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function remove_delete($id)
    {
        return $this->do_delete($id);
    }

    private function do_delete($id)
    {
        $user = $this->Auth_model->check_token();

        if ($user) {
            $data = $this->Transaction_model->delete($user, array('id' => $id));

            if ($data['code'] != 0) {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            } else {
                $this->response($data, REST_Controller::HTTP_OK);
            }
        } else {
            $this->response(['status'=> "Unauthorized"], REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    private function input_fields($is_edit = 0)
    {
        return array(
            'id' => $this->post_or_put('id', $is_edit),
            'account_object_id' => $this->post_or_put('account_object_id', $is_edit),
            'city_id' => $this->post_or_put('city_id', $is_edit),
            'plan_amount' => $this->post_or_put('plan_amount', $is_edit),
            'real_amount' => $this->post_or_put('real_amount', $is_edit),
            'trans_date' => $this->post_or_put('trans_date', $is_edit),
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

    protected function _authenticate_BEARER()
    {   
        $this->load->helper('common');

        $token = get_token();

        if (!isset($token) || $token == 'undefined') {
            $this->response(['status' => '401'], REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

}
