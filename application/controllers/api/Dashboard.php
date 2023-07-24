<?php

defined('BASEPATH') or exit('No direct script access allowed');

require APPPATH . 'libraries/REST_Controller.php';
use Restserver\Libraries\REST_Controller;

class Dashboard extends REST_Controller {

    function __construct()
    {
        parent::__construct();
        $this->_authenticate_CORS();
        $this->_authenticate_BEARER();
        $this->load->model('Auth_model');
        $this->load->model('Dashboard_model');
    }

    public function index_get()
    {
        $this->do_get_index();
    }

    private function do_get_index()
    {   
        $user = $this->Auth_model->check_token();

        if ($user) {
            $limit = !empty($this->get('limit')) ? $this->get('limit') : 0; 
            $offset = !empty($this->get('offset')) ? $this->get('offset') : 0; 
            $order = !empty($this->get('order')) ? $this->get('order') : 'st.account_base_id desc'; 
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $data = $this->Dashboard_model->get_dashboard($user, $limit, $offset, $order, $filter);
        
            if ($data['code'] != 0) {
                $this->response($data, REST_Controller::HTTP_INTERNAL_SERVER_ERROR);
            } else {
                $this->response($data, REST_Controller::HTTP_OK);
            }
        } else {
            $this->response(['status'=> "Unauthorized"], REST_Controller::HTTP_UNAUTHORIZED);
        }
    }

    public function recap_years_get()
    {
        $this->do_get_recap_years();
    }

    private function do_get_recap_years()
    {   
        $user = $this->Auth_model->check_token();

        if ($user) {
            $limit = !empty($this->get('limit')) ? $this->get('limit') : 0; 
            $offset = !empty($this->get('offset')) ? $this->get('offset') : 0; 
            $order = !empty($this->get('order')) ? $this->get('order') : 'st.account_base_id desc'; 
            $filter = !empty($this->get('filter')) ? $this->get('filter') : new stdClass();
            $data = $this->Dashboard_model->get_recap_years($user, $limit, $offset, $order, $filter);
        
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
