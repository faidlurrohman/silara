<?php

class Role_model extends CI_Model {

    function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }

    function get_all()
    {
        $sql = "
            with a as (
                select * from silarakab.role
            ) select a.*,a.id as value,a.remark as label,count(*) over() as ttl_count from a
            order by a.remark asc
        ";
        $query = $this->db->query($sql);
        return model_response($query);
    }

}
