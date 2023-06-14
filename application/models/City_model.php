<?php

class City_model extends CI_Model {

    private $schema = 'get_city';
    private $table  = 'silarakab.city';
    private $cud    = 'silarakab.main_cud';
    private $read   = 'silarakab.main_read';

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }

    function get_all($user, $limit, $offset, $order, $filter)
    {
        $setOrder = set_order($order);
        $sql = "SELECT * FROM {$this->read}($limit, $offset, '".$user['username']."', '".$this->schema."', '".$setOrder."', '[".json_encode($filter)."]'::JSONB)";
        $query = $this->db->query($sql);
        return model_response($query);
    }
    
    function get_list($user)
    {
        $_json = '{"active":"true"}';
        $sql = "
            WITH r AS (
                SELECT * FROM {$this->read}(0, 0, '".$user['username']."', '".$this->schema."', 'label', '[".$_json."]'::jsonb)
            ) SELECT 
                (r.__res_data->>'id')::INT AS id,
                (r.__res_data->>'id')::INT AS value, 
                r.__res_data->>'label' AS label, 
                r.__code, 
                r.__res_msg, 
                COALESCE(r.__res_count,0)::INT AS __res_count
            FROM r
        ";
        $query = $this->db->query($sql);
        return model_response($query, 1);
    }

    function save($user, $params)
    {
        $id = $params['id'];

        if ($id) {
            $mode = 'U';
        } else {
            $params["id"] = '0';
            $mode = 'C';
        }

        if (!empty($_FILES['blob']['name'])){
            $config['encrypt_name'] = TRUE;
            $config['upload_path'] = 'uploads/';
            $config['allowed_types'] = 'jpg|jpeg|png';  
            $config['file_name'] = $_FILES['blob']['name'];
            $config['overwrite'] = true;
            $this->load->library('upload', $config);

            if(!$this->upload->do_upload('blob'))  
            {  
                $error = $this->upload->display_errors(); 
                echo json_encode(array('msg' => $error, 'success' => false));
            }else{
                $params["logo"] = $this->upload->data()['file_name'];
                $sql = "SELECT * from {$this->cud}('".$mode."', '{$this->table}', '".$user['username']."', '[".json_encode($params)."]'::jsonb)";
                $query = $this->db->query($sql,$params);
                return model_response($query, 2);
            }
        }else{
            $sql = "SELECT * from {$this->cud}('".$mode."', '{$this->table}', '".$user['username']."', '[".json_encode($params)."]'::jsonb)";
            $query = $this->db->query($sql,$params);
            return model_response($query, 2);
        }
    }

    function delete($user, $params)
    {
        $sql = "SELECT * from {$this->cud}('D', '{$this->table}', '".$user['username']."', '[".json_encode($params)."]'::jsonb)";
        $query = $this->db->query($sql,$params);
        return model_response($query, 2);
    }

}
