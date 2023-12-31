package PickMe.PickMeDemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostsFormDto {

    // PostsUpdateFormDto와 차이점 : postType이 String 리스트이다.
    // String으로 한 이유 : Frontend에서 Boolean 데이터 넘겨서 받아오는 작업이 매우 어렵다..
    private String title;
    private List<String> postType; // Assuming postType is an array of strings
    private Integer recruitmentCount;
    private LocalDate endDate;
    private String content;
    private String promoteImageUrl;
    private String fileUrl;
}
