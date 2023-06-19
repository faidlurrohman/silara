<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Report extends REST_Controller {

    function __construct()
    {
        parent::__construct();
        $this->_authenticate_CORS();
        $this->_authenticate_BEARER();
        $this->load->model('Auth_model');
        $this->load->model('Report_model');
    }

    public function real_plan_cities_get()
    {
        $this->do_get_real_plan_cities();
    }

    private function do_get_real_plan_cities()
    {   
        $user = $this->Auth_model->check_token();

        if ($user) {
            $limit = !empty($this->get('limit')) ? $this->get('limit') : 0; 
            $offset = !empty($this->get('offset')) ? $this->get('offset') : 0; 
            $order = !empty($this->get('order')) ? $this->get('order') : 'city_label desc'; 
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $data = $this->Report_model->get_real_plan_cities($user, $limit, $offset, $order, $filter);
        
            if ($data['code'] != 0) {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            } else {
                $this->response($data, REST_Controller::HTTP_OK);
            }
        } else {
            $this->response(['status'=> "Unauthorized"], REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function recapitulation_cities_get()
    {
        $this->do_get_recapitulation_cities();
    }

    private function do_get_recapitulation_cities()
    {   
        $user = $this->Auth_model->check_token();

        if ($user) {
            $limit = !empty($this->get('limit')) ? $this->get('limit') : 0; 
            $offset = !empty($this->get('offset')) ? $this->get('offset') : 0; 
            $order = !empty($this->get('order')) ? $this->get('order') : 'city_label desc'; 
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $data = $this->Report_model->get_recapitulation_cities($user, $limit, $offset, $order, $filter);
        
            if ($data['code'] != 0) {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            } else {
                $this->response($data, REST_Controller::HTTP_OK);
            }
        } else {
            $this->response(['status'=> "Unauthorized"], REST_Controller::HTTP_UNAUTHORIZED);
        }
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
